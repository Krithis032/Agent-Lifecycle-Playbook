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
    <div className="border border-[var(--border)] rounded-[var(--radius-sm)] p-4 bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[13px] font-semibold text-[var(--text)] leading-snug">{domainName}</h4>
        <span className="text-xl font-bold text-[var(--accent)]">{scoreDisplay}</span>
      </div>
      {riskLevel && (
        <Badge variant={riskBadge[riskLevel] || 'default'} className="mb-2">{riskLevel}</Badge>
      )}
      {gaps && gaps.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-4)] mb-1">Gaps</div>
          <ul className="text-[11px] text-[var(--text-3)] space-y-0.5">
            {gaps.slice(0, 3).map((g, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-[var(--warning)]">•</span> {typeof g === 'string' ? g : JSON.stringify(g)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {frameworks && frameworks.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {frameworks.slice(0, 2).map((f, i) => (
            <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-4)]">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}
