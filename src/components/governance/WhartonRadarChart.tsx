'use client';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface WhartonRadarProps {
  scores: { domainName: string; score: number }[];
  title?: string;
}

export default function WhartonRadarChart({ scores, title = 'Wharton 10-Domain Governance' }: WhartonRadarProps) {
  const data = {
    labels: scores.map(s => s.domainName),
    datasets: [{
      label: 'Domain Score',
      data: scores.map(s => s.score),
      backgroundColor: 'rgba(0, 82, 204, 0.1)',
      borderColor: '#0052cc',
      borderWidth: 2,
      pointBackgroundColor: '#0052cc',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#0052cc',
      pointRadius: 5,
    }],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 1,
        ticks: { stepSize: 0.25, font: { size: 10 }, backdropColor: 'transparent' },
        pointLabels: { font: { size: 11, family: 'Inter' } },
        grid: { color: 'rgba(0,0,0,0.06)' },
        angleLines: { color: 'rgba(0,0,0,0.06)' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `${ctx.label}: ${(ctx.parsed.r * 100).toFixed(0)}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-6">
      {title && <h3 className="text-[15px] font-semibold mb-4 text-[var(--text)]">{title}</h3>}
      <Radar data={data} options={options} />
    </div>
  );
}
