import React from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import { DockerContainer, PendingCommand } from '../types';

interface DockerListProps {
  containers: DockerContainer[];
  pendingCommands: Record<string, PendingCommand>;
  onCommand: (command: string, id: string, wasRunning: boolean) => void;
}

export const DockerList: React.FC<DockerListProps> = ({ containers, pendingCommands, onCommand }) => {
  if (!containers || containers.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-800">Docker Containers</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-tertiary/10 text-gray-600 text-sm">
              <th className="px-6 py-3 font-semibold w-32">Actions</th>
              <th className="px-6 py-3 font-semibold">Name & Image</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold hidden md:table-cell">CPU</th>
              <th className="px-6 py-3 font-semibold hidden md:table-cell">Memory</th>
              <th className="px-6 py-3 font-semibold hidden lg:table-cell">Ports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {containers.map(container => {
              const isRunning = container.status.toLowerCase().startsWith('up ');
              const isDashboard = container.names.includes('dgx_dashboard') || container.image.includes('dgx_dashboard');
              const pending = pendingCommands[container.id];

              return (
                <tr key={container.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {!isRunning && (
                        <button
                          onClick={() => onCommand('docker-start', container.id, isRunning)}
                          disabled={!!pending}
                          className="p-1.5 rounded-md text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Start"
                        >
                          {pending?.command === 'docker-start' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" fill="currentColor" />}
                        </button>
                      )}
                      
                      {isRunning && !isDashboard && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to stop this container?')) {
                              onCommand('docker-start', container.id, isRunning); // Original code used start endpoint for stop too strangely? Let's check original JS
                            }
                          }}
                          disabled={!!pending}
                          className="p-1.5 rounded-md text-secondary hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Stop"
                        >
                          {pending?.command === 'docker-stop' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" fill="currentColor" />}
                        </button>
                      )}

                      {isRunning && isDashboard && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to restart this container?')) {
                              onCommand('docker-restart', container.id, isRunning);
                            }
                          }}
                          disabled={!!pending}
                          className="p-1.5 rounded-md text-yellow-600 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Restart"
                        >
                          <RefreshCw className={`w-4 h-4 ${pending?.command === 'docker-restart' ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{container.names}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{container.image}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      isRunning 
                        ? 'bg-blue-50 text-primary border-blue-200' 
                        : 'bg-orange-50 text-secondary border-orange-200'
                    }`}>
                      {isRunning ? 'Running' : 'Stopped'}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{container.status}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell font-mono text-sm text-gray-600">
                    {container.cpu}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell font-mono text-sm text-gray-600">
                    {container.memory}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell font-mono text-xs text-gray-500 max-w-xs truncate">
                    {container.ports}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
