'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BAR_COLORS = ['#0052cc', '#ba1a1a', '#15803d', '#6b3fa0', '#0e7490', '#b45309'];

interface EvalBarProps {
  results: { optionName: string; totalScore: number; rank: number }[];
}

export default function EvalBarChart({ results }: EvalBarProps) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
      <h3 className="text-[15px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Weighted Score Ranking</h3>
      <Bar
        data={{
          labels: results.map(r => r.optionName),
          datasets: [{
            label: 'Weighted Score',
            data: results.map(r => r.totalScore),
            backgroundColor: results.map((_, i) => BAR_COLORS[i % BAR_COLORS.length] + '20'),
            borderColor: results.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
            borderWidth: 2,
            borderRadius: 6,
            barThickness: 36,
          }],
        }}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              min: 0,
              max: 5,
              ticks: { stepSize: 1, font: { size: 11, family: 'Urbanist' } },
              grid: { color: 'rgba(226, 232, 240, 0.4)' },
            },
            y: {
              ticks: { font: { size: 12, family: 'Urbanist', weight: 'bold' } },
              grid: { display: false },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Score: ${(ctx.parsed.x ?? 0).toFixed(2)} / 5.00`,
              },
            },
          },
        }}
        style={{ height: `${Math.max(results.length * 52, 120)}px` }}
      />
    </div>
  );
}
