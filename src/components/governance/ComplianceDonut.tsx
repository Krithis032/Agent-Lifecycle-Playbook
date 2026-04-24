'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ComplianceDonutProps {
  compliant: number;
  partial: number;
  nonCompliant: number;
  notApplicable: number;
}

export default function ComplianceDonut({ compliant, partial, nonCompliant, notApplicable }: ComplianceDonutProps) {
  const data = {
    labels: ['Compliant', 'Partial', 'Non-Compliant', 'N/A'],
    datasets: [{
      data: [compliant, partial, nonCompliant, notApplicable],
      backgroundColor: ['#15803d', '#b45309', '#ba1a1a', '#94a3b8'],
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  };

  const total = compliant + partial + nonCompliant + notApplicable;
  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11, family: 'Inter' }, padding: 16 } },
    },
  };

  return (
    <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-6">
      <h3 className="text-[15px] font-semibold mb-4 text-[var(--text)]">Compliance Status</h3>
      <div className="relative max-w-[240px] mx-auto">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10px' }}>
          <span className="text-3xl font-bold text-[var(--text)]">{complianceRate}%</span>
          <span className="text-[11px] text-[var(--text-3)]">Compliant</span>
        </div>
      </div>
    </div>
  );
}
