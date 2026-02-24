import React from 'react';
import { MemoryGauge } from './MemoryGauge';
import { MemoryLineChart } from './MemoryLineChart';

interface GaugeWidgetProps {
  usedGB: number;
  totalGB: number;
  memoryHistory: number[];
}

export const GaugeWidget: React.FC<GaugeWidgetProps> = ({ usedGB, totalGB, memoryHistory }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <h3 className="text-xl font-bold text-primary mb-6">Memory Usage</h3>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center min-h-[300px]">
        <div className="w-full h-full min-h-[200px] flex justify-center items-center">
          <MemoryGauge usedGB={usedGB} totalGB={totalGB} />
        </div>
        
        <div className="w-full h-full min-h-[200px]">
          <MemoryLineChart memoryHistory={memoryHistory} maxMemory={totalGB} />
        </div>
      </div>
    </div>
  );
};
