'use client';

import Badge from '@/components/ui/Badge';
import type { RiskItem } from '@/types/governance';

interface RiskItemCardProps {
  risk: RiskItem;
  onStatusChange?: (status: string) => void;
  onMitigationChange?: (mitigation: string) => void;
}

const severityVariant: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'success',
};

const categoryLabels: Record<string, string> = {
  data: 'Data',
  model: 'Model',
  security: 'Security',
  compliance: 'Compliance',
  operational: 'Operational',
  ethical: 'Ethical',
};

export default function RiskItemCard({ risk, onStatusChange, onMitigationChange }: RiskItemCardProps) {
  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-sm)] p-4 bg-[var(--surface)]">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[13px] font-semibold text-[var(--text)] leading-snug">{risk.title}</h4>
        <div className="flex gap-1.5 shrink-0 ml-2">
          <Badge variant={severityVariant[risk.severity] || 'default'}>{risk.severity}</Badge>
          <Badge variant="accent">{categoryLabels[risk.category] || risk.category}</Badge>
        </div>
      </div>
      {risk.description && (
        <p className="text-[12px] text-[var(--text-3)] mb-3">{risk.description}</p>
      )}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-[11px] font-bold text-[var(--text-4)] uppercase">Status:</label>
        {onStatusChange ? (
          <select
            value={risk.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-[12px] px-2 py-1 border border-[var(--border)] rounded bg-[var(--surface)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="open">Open</option>
            <option value="mitigated">Mitigated</option>
            <option value="accepted">Accepted</option>
            <option value="closed">Closed</option>
          </select>
        ) : (
          <Badge variant={risk.status === 'closed' ? 'success' : 'default'}>{risk.status}</Badge>
        )}
      </div>
      {risk.mitigation && (
        <div className="bg-[var(--surface-hover)] rounded p-2 text-[12px] text-[var(--text-2)]">
          <span className="font-semibold">Mitigation: </span>{risk.mitigation}
        </div>
      )}
      {onMitigationChange && !risk.mitigation && (
        <input
          type="text"
          placeholder="Add mitigation plan..."
          className="w-full mt-2 px-2 py-1 border border-[var(--border)] rounded bg-[var(--bg)] text-[var(--text)] text-[12px] focus:border-[var(--accent)] focus:outline-none"
          onBlur={(e) => { if (e.target.value) onMitigationChange(e.target.value); }}
        />
      )}
    </div>
  );
}
