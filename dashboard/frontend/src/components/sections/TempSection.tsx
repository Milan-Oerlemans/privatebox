import React from 'react';
import { Section } from '../Section';
import { LineChart } from '../charts/LineChart';
import { TemperatureMetrics } from '../../types';

interface TempSectionProps {
  temperature: TemperatureMetrics;
  history: {
    gpuTemp: number[];
    sysTemp: number[];
  };
}

export const TempSection: React.FC<TempSectionProps> = ({ history }) => {
  const tempData = [
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
    <Section className="bg-white">
      <div className="w-full h-full flex flex-col p-4 space-y-2 max-h-screen">
        <h3 className="text-xl md:text-2xl font-bold text-primary shrink-0">Temperatures</h3>
        
        <div className="flex-1 w-full min-h-0 relative">
          <LineChart datasets={tempData} yAxisMax={100} yAxisLabel="Temperature °C" />
        </div>
      </div>
    </Section>
  );
};
