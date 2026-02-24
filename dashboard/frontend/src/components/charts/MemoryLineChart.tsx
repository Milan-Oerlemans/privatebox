import React, { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MemoryLineChartProps {
  memoryHistory: number[];
  maxMemory: number;
}

export const MemoryLineChart: React.FC<MemoryLineChartProps> = ({ memoryHistory, maxMemory }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const data = {
    labels: Array.from({ length: memoryHistory.length }, (_, i) => i + 1),
    datasets: [{
      label: 'Memory',
      data: memoryHistory,
      borderColor: 'rgb(0, 87, 255)', // Primary
      backgroundColor: 'rgba(0, 87, 255, 0.1)',
      tension: 0.4,
      segment: {
        borderColor: (ctx: any) => {
          // Get the max value from the y-axis scale
          const maxValue = ctx.chart.options.scales.y.max;
          const yellowThreshold = maxValue * 0.8;
          const redThreshold = maxValue * 0.9;

          // Get the value at the end of this segment
          const value = ctx.p1.parsed.y;

          if (value >= redThreshold) {
            return 'rgb(255, 68, 68)'; // Red
          } else if (value >= yellowThreshold) {
            return 'rgb(231, 121, 87)'; // Secondary
          } else {
            return 'rgb(0, 87, 255)'; // Primary
          }
        }
      }
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      y: {
        beginAtZero: true,
        max: Math.trunc(maxMemory),
        title: {
          display: true,
          text: 'GB'
        }
      },
      x: {
        display: false
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return <Line ref={chartRef} data={data as any} options={options as any} />;
};
