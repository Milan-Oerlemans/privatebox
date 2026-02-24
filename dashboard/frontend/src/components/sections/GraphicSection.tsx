import React from 'react';
import { Section } from '../Section';
import userIcon from '../../assets/user.svg';
import gearIcon from '../../assets/gear.svg';
import chipIcon from '../../assets/ai-chip.svg';
import docIcon from '../../assets/doc.svg';

interface GraphicSectionProps {
  gpuUsage: number;
}

export const GraphicSection: React.FC<GraphicSectionProps> = ({ gpuUsage }) => {
  const isActive = gpuUsage > 0;

  return (
    <Section className="bg-white">
      <div className="w-full h-full flex items-center justify-between px-8 md:px-16 max-w-6xl mx-auto relative overflow-hidden">
        
        {/* Left: User */}
        <div className="z-10 flex flex-col items-center flex-shrink-0">
          <img src={userIcon} alt="User" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
        </div>

        {/* Connecting Line: User -> Gear */}
        <div className="flex-1 h-[2px] bg-black relative mx-4 overflow-hidden">
           {isActive && (
             <div className="absolute inset-0 w-full h-full">
               <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-slide-right" />
             </div>
           )}
        </div>

        {/* Center: Gear (Spinning) & Chip (Static) */}
        <div className="z-10 relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          {/* Static Chip in Center */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <img src={chipIcon} alt="AI Chip" className="w-12 h-12 object-contain" />
          </div>
          
          {/* Spinning Gear */}
          <div className={`absolute inset-0 z-10 ${isActive ? 'animate-spin-slow' : ''}`}>
             <img src={gearIcon} alt="Processing Gear" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Connecting Line: Gear -> Doc */}
        <div className="flex-1 h-[2px] bg-black relative mx-4 overflow-hidden">
           {isActive && (
             <div className="absolute inset-0 w-full h-full">
               <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary to-transparent animate-slide-right delay-700" />
             </div>
           )}
        </div>

        {/* Right: Doc */}
        <div className="z-10 flex flex-col items-center flex-shrink-0">
          <img src={docIcon} alt="Document" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
        </div>

      </div>
      
      {/* GPU Usage Label */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-gray-400 font-mono text-xs uppercase tracking-widest w-full">
        GPU Load: {gpuUsage}% {isActive ? '• PROCESSING' : '• IDLE'}
      </div>
    </Section>
  );
};
