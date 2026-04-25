'use client';

import EvalRadarChart from './EvalRadarChart';
import EvalBarChart from './EvalBarChart';
import Badge from '@/components/ui/Badge';
import { Trophy } from 'lucide-react';
import type { EvalCriterion, EvalScore, WeightedScoreResult } from '@/types/evaluation';

interface EvalResultsProps {
  results: WeightedScoreResult[];
  criteria: EvalCriterion[];
  scores: EvalScore[];
  recommendation: string;
  rationale: string;
}

export default function EvalResults({ results, criteria, scores, recommendation, rationale }: EvalResultsProps) {
  const criteriaNames = criteria.map(c => c.name);
  const radarOptions = results.map(r => ({
    name: r.optionName,
    scores: criteria.map(c => {
      const s = scores.find(s => s.optionKey === r.optionKey && s.criterionKey === c.key);
      return s?.score || 0;
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <div className="rounded-xl p-5" style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand-primary)' }}>
        <div className="flex items-start gap-3">
          <Trophy size={24} className="shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--brand-primary)' }}>Recommendation</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{recommendation}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{rationale}</div>
          </div>
        </div>
      </div>

      {/* Ranking cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map(r => (
          <div
            key={r.optionKey}
            className="p-4 rounded-xl"
            style={{
              border: r.rank === 1 ? '2px solid var(--brand-primary)' : '1px solid var(--border-default)',
              background: r.rank === 1 ? 'var(--brand-soft)' : 'var(--surface-elevated)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: r.rank === 1 ? 'var(--brand-primary)' : 'var(--surface-1)',
                  color: r.rank === 1 ? '#fff' : 'var(--text-tertiary)',
                }}
              >
                #{r.rank}
              </span>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.optionName}</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{r.totalScore.toFixed(2)}</span>
              <span className="text-xs mb-1" style={{ color: 'var(--text-quaternary)' }}>/ 5.00</span>
            </div>
            {r.rank === 1 && <Badge variant="brand" className="mt-2">Winner</Badge>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvalRadarChart criteriaNames={criteriaNames} options={radarOptions} />
        <EvalBarChart results={results} />
      </div>
    </div>
  );
}
