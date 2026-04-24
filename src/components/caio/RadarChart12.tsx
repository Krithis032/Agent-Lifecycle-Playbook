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

interface RadarChart12Props {
  scores: { domainName: string; score: number }[];
  targetScores?: { domainName: string; score: number }[];
}

export default function RadarChart12({ scores, targetScores }: RadarChart12Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datasets: any[] = [
    {
      label: 'Current Score',
      data: scores.map(s => s.score),
      backgroundColor: 'rgba(0, 82, 204, 0.1)',
      borderColor: '#0052cc',
      borderWidth: 2,
      pointBackgroundColor: '#0052cc',
      pointRadius: 4,
    },
  ];

  if (targetScores) {
    datasets.push({
      label: 'Target',
      data: targetScores.map(s => s.score),
      backgroundColor: 'rgba(21, 128, 61, 0.05)',
      borderColor: '#15803d',
      borderWidth: 1.5,
      pointBackgroundColor: '#15803d',
      pointRadius: 3,
      borderDash: [5, 5],
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, font: { size: 10 }, backdropColor: 'transparent' },
        pointLabels: { font: { size: 10, family: 'Inter' } },
        grid: { color: 'rgba(0,0,0,0.06)' },
        angleLines: { color: 'rgba(0,0,0,0.06)' },
      },
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { font: { size: 11, family: 'Inter' } } },
    },
  };

  return (
    <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-6">
      <h3 className="text-[15px] font-semibold mb-4 text-[var(--text)]">CAIO 12-Domain Assessment</h3>
      <Radar data={{ labels: scores.map(s => s.domainName), datasets }} options={options} />
    </div>
  );
}
