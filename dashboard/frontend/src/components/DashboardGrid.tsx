import React, { useMemo } from 'react';
import { LineChart } from './charts/LineChart';
import { GaugeWidget } from './charts/GaugeWidget';
import { DashboardData } from '../types';

interface DashboardGridProps {
  data: DashboardData | null;
  history: {
    gpu: number[];
    cpu: number[];
    gpuTemp: number[];
    sysTemp: number[];
    memory: number[];
  }
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ data, history }) => {
  const memoryUsedGB = useMemo(() => {
    if (!data?.memory) return 0;
    return parseFloat((data.memory.usedKB / 1000000).toFixed(1));
  }, [data?.memory]);

  const memoryTotalGB = useMemo(() => {
    if (!data?.memory) return 128;
    return Math.trunc(data.memory.totalKB / 1000000);
  }, [data?.memory]);

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

  const tempUsageData = [
    {
      label: 'GPU °C',
      data: history.gpuTemp,
      borderColor: 'rgb(0, 87, 255)',
      backgroundColor: 'rgba(0, 87, 255, 0.1)'
    },
    {
      label: 'System °C',
      data: history.sysTemp,
      borderColor: 'rgb(231, 121, 87)',
      backgroundColor: 'rgba(231, 121, 87, 0.1)'
    }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1600px] mx-auto p-4 md:p-8 pt-24">
      
      {/* Memory Widget spans full width on smaller screens, 1 col on XL */}
      <div className="col-span-1 xl:col-span-2">
        <GaugeWidget 
          usedGB={memoryUsedGB} 
          totalGB={memoryTotalGB} 
          memoryHistory={history.memory} 
        />
      </div>

      {/* GPU & CPU Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
        <h3 className="text-xl font-bold text-primary mb-4">GPU & CPU Usage</h3>
        <div className="flex-1 min-h-0 relative">
          <LineChart datasets={gpuUsageData} yAxisMax={100} yAxisLabel="Usage %" />
        </div>
        <div className="text-center font-medium mt-4 text-gray-700 bg-gray-50 py-2 rounded-lg">
          GPU Power: {data?.gpu?.powerW?.toFixed(0) ?? '?'} W
        </div>
      </div>

      {/* Temperatures */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
        <h3 className="text-xl font-bold text-primary mb-4">Temperatures</h3>
        <div className="flex-1 min-h-0 relative">
          <LineChart datasets={tempUsageData} yAxisMax={100} yAxisLabel="Temperature °C" />
        </div>
      </div>
      
    </div>
  );
};
