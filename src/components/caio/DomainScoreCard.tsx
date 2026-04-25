'use client';

import Badge from '@/components/ui/Badge';

interface DomainScoreCardProps {
  domainName: string;
  domainKey: string;
  score: number;
  riskLevel?: string | null;
  gaps?: string[] | null;
  frameworks?: readonly string[];
}

export default function DomainScoreCard({ domainName, score, riskLevel, gaps, frameworks }: DomainScoreCardProps) {
  const scoreDisplay = typeof score === 'number' && score <= 1 ? (score * 5).toFixed(1) : String(score);
  const riskBadge: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    low: 'success', medium: 'warning', high: 'error', critical: 'error',
  };

  return (
    <div
      className="rounded-lg p-4 transition-colors cursor-default"
      style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-elevated)'}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{domainName}</h4>
        <span className="text-xl font-bold" style={{ color: 'var(--module-caio)' }}>{scoreDisplay}</span>
      </div>
      {riskLevel && (
        <Badge variant={riskBadge[riskLevel] || 'default'} className="mb-2">{riskLevel}</Badge>
      )}
      {gaps && gaps.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-quaternary)' }}>Gaps</div>
          <ul className="text-[11px] space-y-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {gaps.slice(0, 3).map((g, i) => (
              <li key={i} className="flex items-start gap-1">
                <span style={{ color: 'var(--status-warning)' }}>•</span> {typeof g === 'string' ? g : JSON.stringify(g)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {frameworks && frameworks.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {frameworks.slice(0, 2).map((f, i) => (
            <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-0)', color: 'var(--text-quaternary)' }}>{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}
