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
    <div className="rounded-[var(--radius-sm)] p-4" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{risk.title}</h4>
        <div className="flex gap-1.5 shrink-0 ml-2">
          <Badge variant={severityVariant[risk.severity] || 'default'}>{risk.severity}</Badge>
          <Badge variant="brand">{categoryLabels[risk.category] || risk.category}</Badge>
        </div>
      </div>
      {risk.description && (
        <p className="text-[12px] mb-3" style={{ color: 'var(--text-tertiary)' }}>{risk.description}</p>
      )}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-[11px] font-bold uppercase" style={{ color: 'var(--text-quaternary)' }}>Status:</label>
        {onStatusChange ? (
          <select
            value={risk.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-[12px] px-2 py-1 rounded transition-all focus:outline-none"
            style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
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
        <div className="rounded p-2 text-[12px]" style={{ background: 'var(--surface-0)', color: 'var(--text-secondary)' }}>
          <span className="font-semibold">Mitigation: </span>{risk.mitigation}
        </div>
      )}
      {onMitigationChange && !risk.mitigation && (
        <input
          type="text"
          placeholder="Add mitigation plan..."
          className="w-full mt-2 px-2 py-1 rounded text-[12px] transition-all focus:outline-none focus:ring-2"
          style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; if (e.target.value) onMitigationChange(e.target.value); }}
        />
      )}
    </div>
  );
}
