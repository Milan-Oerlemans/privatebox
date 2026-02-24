import React from 'react';
import { Section } from '../Section';
import { MemoryGauge } from '../charts/MemoryGauge';
import { MemoryLineChart } from '../charts/MemoryLineChart';
import { MemoryMetrics } from '../../types';

interface MemorySectionProps {
  memory: MemoryMetrics;
  history: number[];
}

export const MemorySection: React.FC<MemorySectionProps> = ({ memory, history }) => {
  const usedGB = parseFloat((memory.usedKB / 1000000).toFixed(1));
  const totalGB = Math.trunc(memory.totalKB / 1000000);

  return (
    <Section className="bg-white">
      <div className="w-full h-full flex flex-col p-4 space-y-2 max-h-screen">
        <h3 className="text-xl md:text-2xl font-bold text-primary shrink-0">Memory Usage</h3>
        
        <div className="flex-1 w-full min-h-0 flex flex-row items-center justify-center space-x-4 md:space-x-8">
           {/* Memory Gauge */}
           <div className="flex-1 h-full min-w-0 flex items-center justify-center relative">
             <div className="w-full h-full relative">
                <MemoryGauge usedGB={usedGB} totalGB={totalGB} />
             </div>
           </div>

           {/* Memory History Line Chart */}
           <div className="flex-1 h-full min-w-0 flex items-center justify-center relative">
              <div className="w-full h-full relative">
                 <MemoryLineChart memoryHistory={history} maxMemory={totalGB} />
              </div>
           </div>
        </div>
      </div>
    </Section>
  );
};
