import React, { useEffect, useState } from 'react';

interface StatusHeaderProps {
  status: string;
  smiCrashed: boolean;
  nextPollSeconds: number | undefined;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ status, smiCrashed, nextPollSeconds }) => {
  const [progressWidth, setProgressWidth] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!nextPollSeconds) return;

    setProgressWidth(100);
    
    // Slight delay to ensure the DOM updates before starting transition
    const timeout = setTimeout(() => {
      setProgressWidth(0);
    }, 50);

    return () => clearTimeout(timeout);
  }, [nextPollSeconds]);

  // Handle scroll to show/hide
  useEffect(() => {
    
    // We'll use a mousemove/touch handler on the window to detect intent near top
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const y = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      if (y < 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove); // For initial touch
    window.addEventListener('touchmove', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  return (
    <>
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 transform ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div 
          className="h-[2px] bg-primary transition-all ease-linear"
          style={{ 
            width: `${progressWidth}%`, 
            transitionDuration: progressWidth === 0 ? `${nextPollSeconds}s` : '0s' 
          }}
        />
        <div className="bg-white/90 backdrop-blur-sm shadow-sm px-4 py-2 flex items-center justify-between">
           <span className={`text-xs font-semibold uppercase tracking-wider ${
            status === 'Connected' ? 'text-green-500' : 
            status === 'Error' ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {status}
          </span>
          {smiCrashed && (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
              GPU Error
            </span>
          )}
        </div>
      </div>
      
      {/* Invisible trigger zone at the top */}
      <div className="fixed top-0 left-0 right-0 h-4 z-40" /> 
    </>
  );
};
