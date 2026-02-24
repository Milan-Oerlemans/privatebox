import React, { useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Plugin } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MemoryGaugeProps {
  usedGB: number;
  totalGB: number;
}

const gaugePlugin: Plugin<'doughnut'> = {
  id: 'gaugeText',
  beforeDraw: (chart) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    
    const { usedGB, totalGB } = (chart.config.options?.plugins as any)?.gaugeText || { usedGB: 0, totalGB: 0 };
    
    const { left, width, bottom } = chartArea;
    const centerX = left + width / 2;
    const centerY = bottom - 10;
    
    // Calculate responsive font size based on chart width
    // Base size 32px for width 300px, scaled down
    const baseFontSize = Math.max(16, Math.min(32, width / 10));
    const smallFontSize = Math.max(10, baseFontSize * 0.45);

    // Dynamic padding between gauge (the arc) and the text
    const textPadding = Math.min(20, width * 0.05); // 5% of width or max 20px

    ctx.save();
    
    // Draw Used GB
    ctx.font = `bold ${baseFontSize}px "Plus Jakarta Sans"`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    // Move text UP from center-bottom reference point
    ctx.fillText(`${usedGB.toFixed(1)}GB`, centerX, centerY - (baseFontSize * 0.5) - textPadding);

    // Draw Total GB
    ctx.font = `${smallFontSize}px "Plus Jakarta Sans"`;
    ctx.fillStyle = 'gray';
    // Move text DOWN from center-bottom reference point
    ctx.fillText(`/${totalGB}GB`, centerX, centerY + (smallFontSize * 0.8) - textPadding);

    ctx.restore();
  }
};

export const MemoryGauge: React.FC<MemoryGaugeProps> = ({ usedGB, totalGB }) => {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  const yellowFrom = totalGB * 0.8;
  const redFrom = totalGB * 0.9;
  
  let color = 'rgb(0, 87, 255)';
  if (usedGB >= redFrom) color = 'rgb(255, 68, 68)';
  else if (usedGB >= yellowFrom) color = 'rgb(231, 121, 87)';

  const data = {
    datasets: [
      {
        data: [totalGB * 0.8, totalGB * 0.1, totalGB * 0.1],
        backgroundColor: [
          'rgb(0, 87, 255)',
          'rgb(231, 121, 87)',
          'rgb(255, 68, 68)'
        ],
        borderWidth: 5,
        borderColor: 'white',
        weight: 0.15
      },
      {
        data: [Math.min(usedGB, totalGB), Math.max(0, totalGB - usedGB)],
        backgroundColor: [color, 'rgb(230, 230, 230)'],
        borderWidth: 0,
        weight: 0.85
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    circumference: 180,
    rotation: 270,
    cutout: '70%', // Increased cutout from 50% to 70% to create more gap between graph and text
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      gaugeText: { usedGB, totalGB }
    },
    layout: {
       padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
       }
    }
  };

  return <Doughnut ref={chartRef} data={data} options={options as any} plugins={[gaugePlugin]} />;
};
