'use client';

import Badge from '@/components/ui/Badge';
import type { CaioFinding } from '@/types/caio';

interface FindingsPanelProps {
  findings: CaioFinding[];
}

const severityConfig: Record<string, { variant: 'error' | 'warning' | 'success'; label: string; dotColor: string }> = {
  critical: { variant: 'error', label: 'Critical', dotColor: 'var(--status-error)' },
  warning: { variant: 'warning', label: 'Warning', dotColor: 'var(--status-warning)' },
  good: { variant: 'success', label: 'Good', dotColor: 'var(--status-success)' },
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
            <h3 className="text-[13px] font-bold flex items-center gap-2 mb-3 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: config.dotColor }} />
              {config.label} Findings ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((f) => (
                <div key={f.id} className="rounded-lg p-4" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{f.title}</h4>
                    <Badge variant={config.variant}>{severity}</Badge>
                  </div>
                  <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>{f.finding}</p>
                  {f.rationale && (
                    <p className="text-[11px] italic mb-2" style={{ color: 'var(--text-tertiary)' }}>{f.rationale}</p>
                  )}
                  {f.frameworkRef && (
                    <Badge variant="brand">{f.frameworkRef}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {findings.length === 0 && (
        <p className="text-center py-6" style={{ color: 'var(--text-tertiary)' }}>No findings generated</p>
      )}
    </div>
  );
}
