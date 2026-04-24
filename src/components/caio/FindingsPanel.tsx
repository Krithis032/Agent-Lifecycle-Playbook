'use client';

import Badge from '@/components/ui/Badge';
import type { CaioFinding } from '@/types/caio';

interface FindingsPanelProps {
  findings: CaioFinding[];
}

const severityConfig: Record<string, { variant: 'error' | 'warning' | 'success'; icon: string; label: string }> = {
  critical: { variant: 'error', icon: '🔴', label: 'Critical' },
  warning: { variant: 'warning', icon: '🟡', label: 'Warning' },
  good: { variant: 'success', icon: '🟢', label: 'Good' },
};

export default function FindingsPanel({ findings }: FindingsPanelProps) {
  const grouped = {
    critical: findings.filter(f => f.severity === 'critical'),
    warning: findings.filter(f => f.severity === 'warning'),
    good: findings.filter(f => f.severity === 'good'),
  };

  return (
    <div className="space-y-6">
      {(['critical', 'warning', 'good'] as const).map(severity => {
        const items = grouped[severity];
        if (items.length === 0) return null;
        const config = severityConfig[severity];

        return (
          <div key={severity}>
            <h3 className="text-[13px] font-bold text-[var(--text)] flex items-center gap-2 mb-3 uppercase tracking-wider">
              {config.icon} {config.label} Findings ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((f) => (
                <div key={f.id} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-[13px] font-semibold text-[var(--text)]">{f.title}</h4>
                    <Badge variant={config.variant}>{severity}</Badge>
                  </div>
                  <p className="text-[12px] text-[var(--text-2)] mb-2">{f.finding}</p>
                  {f.rationale && (
                    <p className="text-[11px] text-[var(--text-3)] italic mb-2">{f.rationale}</p>
                  )}
                  {f.frameworkRef && (
                    <Badge variant="accent">{f.frameworkRef}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {findings.length === 0 && (
        <p className="text-center text-[var(--text-3)] py-6">No findings generated</p>
      )}
    </div>
  );
}
