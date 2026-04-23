'use client';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const COLORS = [
  { bg: 'rgba(0, 82, 204, 0.10)', border: '#0052cc' },
  { bg: 'rgba(186, 26, 26, 0.10)', border: '#ba1a1a' },
  { bg: 'rgba(21, 128, 61, 0.10)', border: '#15803d' },
  { bg: 'rgba(107, 63, 160, 0.10)', border: '#6b3fa0' },
  { bg: 'rgba(14, 116, 144, 0.10)', border: '#0e7490' },
  { bg: 'rgba(180, 83, 9, 0.10)', border: '#b45309' },
];

interface EvalRadarProps {
  criteriaNames: string[];
  options: { name: string; scores: number[] }[];
}

export default function EvalRadarChart({ criteriaNames, options }: EvalRadarProps) {
  const data = {
    labels: criteriaNames,
    datasets: options.map((opt, i) => ({
      label: opt.name,
      data: opt.scores,
      backgroundColor: COLORS[i % COLORS.length].bg,
      borderColor: COLORS[i % COLORS.length].border,
      borderWidth: 2,
      pointBackgroundColor: COLORS[i % COLORS.length].border,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  return (
    <div className="bg-[var(--surface-active)] rounded-xl border border-[var(--border)] p-6">
      <h3 className="text-[15px] font-semibold text-[var(--text)] mb-4">Criteria Comparison</h3>
      <div className="max-w-[480px] mx-auto">
        <Radar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              r: {
                min: 0,
                max: 5,
                ticks: { stepSize: 1, font: { size: 10, family: 'Inter' }, backdropColor: 'transparent' },
                pointLabels: { font: { size: 11, family: 'Inter', weight: 'bold' }, color: '#334155' },
                grid: { color: 'rgba(226, 232, 240, 0.6)' },
                angleLines: { color: 'rgba(226, 232, 240, 0.4)' },
              },
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: { font: { size: 12, family: 'Inter' }, padding: 16, usePointStyle: true, pointStyle: 'circle' },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.r.toFixed(1)}/5`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
