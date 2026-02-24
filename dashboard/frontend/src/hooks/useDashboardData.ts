import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardData, PendingCommand } from '../types';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<'Connecting...' | 'Connected' | 'Disconnected - Reconnecting...' | 'Error'>('Connecting...');
  const [smiCrashed, setSmiCrashed] = useState(false);
  const [pendingCommands, setPendingCommands] = useState<Record<string, PendingCommand>>({});
  
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use window.location.host in prod, or localhost:8080 during dev if proxy isn't perfect
    const host = process.env.NODE_ENV === 'development' ? 'localhost:8080' : window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const parsedData: DashboardData = JSON.parse(event.data);
        
        if (!parsedData.gpu) {
          setSmiCrashed(true);
        } else {
          setSmiCrashed(false);
        }

        setData(parsedData);
        
        // Clean up pending commands if they're resolved or timed out (10s)
        setPendingCommands(prev => {
          const next = { ...prev };
          let changed = false;
          const now = Date.now();
          
          parsedData.docker?.forEach(container => {
            const pending = next[container.id];
            if (pending) {
              const isRunning = container.status.toLowerCase().startsWith('up ');
              const elapsed = now - pending.timestamp;
              if (elapsed >= 10000 || pending.wasRunning !== isRunning) {
                delete next[container.id];
                changed = true;
              }
            }
          });
          
          return changed ? next : prev;
        });

      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('Error');
    };

    ws.onclose = () => {
      setStatus('Disconnected - Reconnecting...');
      setTimeout(connect, 1000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendCommand = useCallback((command: string, id: string, wasRunning: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setPendingCommands(prev => ({
        ...prev,
        [id]: { command, timestamp: Date.now(), wasRunning }
      }));
      wsRef.current.send(JSON.stringify({ command, id }));
    }
  }, []);

  return { data, status, smiCrashed, pendingCommands, sendCommand };
}
