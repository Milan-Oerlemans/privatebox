import React, { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface LineChartProps {
  datasets: Dataset[];
  yAxisMax: number;
  yAxisLabel: string;
}

export const LineChart: React.FC<LineChartProps> = ({ datasets, yAxisMax, yAxisLabel }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const data = {
    labels: Array.from({ length: datasets[0]?.data.length || 0 }, (_, i) => i + 1),
    datasets: datasets.map(ds => ({
      ...ds,
      tension: 0.4,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Important for performance on rapid updates
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
        title: {
          display: true,
          text: yAxisLabel
        }
      },
      x: {
        display: false
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  return <Line ref={chartRef} data={data} options={options as any} />;
};
