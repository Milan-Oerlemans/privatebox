import React from 'react';
import { Section } from '../Section';
import { LineChart } from '../charts/LineChart';
import { GpuMetrics, CpuMetrics } from '../../types';

interface CpuGpuSectionProps {
  gpu: GpuMetrics | null;
  cpu: CpuMetrics;
  history: {
    gpu: number[];
    cpu: number[];
  };
}

export const CpuGpuSection: React.FC<CpuGpuSectionProps> = ({ gpu, history }) => {
  const gpuUsageData = [
    {
      label: 'GPU %',
      data: history.gpu,
      borderColor: 'rgb(0, 87, 255)',
      backgroundColor: 'rgba(0, 87, 255, 0.1)'
    },
    {
      label: 'CPU %',
      data: history.cpu,
      borderColor: 'rgb(231, 121, 87)',
      backgroundColor: 'rgba(231, 121, 87, 0.1)'
    }
  ];

  return (
    <Section className="bg-white">
      <div className="w-full h-full flex flex-col p-4 space-y-2 max-h-screen">
        <div className="flex justify-between items-center w-full shrink-0">
           <h3 className="text-xl md:text-2xl font-bold text-primary">GPU & CPU Usage</h3>
           <div className="text-sm md:text-lg font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-lg">
             {gpu?.powerW?.toFixed(0) ?? '?'} W
           </div>
        </div>
        
        <div className="flex-1 w-full min-h-0 relative">
          <LineChart datasets={gpuUsageData} yAxisMax={100} yAxisLabel="Usage %" />
        </div>
      </div>
    </Section>
  );
};
