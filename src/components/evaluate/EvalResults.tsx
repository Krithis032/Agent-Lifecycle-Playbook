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
      <div className="bg-[var(--accent-soft)] border border-[var(--accent)] rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Trophy size={24} className="text-[var(--accent)] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1">Recommendation</div>
            <div className="text-lg font-bold text-[var(--text)]">{recommendation}</div>
            <div className="text-sm text-[var(--text-2)] mt-1">{rationale}</div>
          </div>
        </div>
      </div>

      {/* Ranking cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map(r => (
          <div
            key={r.optionKey}
            className={`p-4 rounded-xl border ${
              r.rank === 1
                ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                : 'border-[var(--border)] bg-[var(--surface-active)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                r.rank === 1 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--text-3)]'
              }`}>
                #{r.rank}
              </span>
              <span className="font-semibold text-[var(--text)] text-sm">{r.optionName}</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-[var(--text)] tabular-nums">{r.totalScore.toFixed(2)}</span>
              <span className="text-xs text-[var(--text-4)] mb-1">/ 5.00</span>
            </div>
            {r.rank === 1 && <Badge variant="accent" className="mt-2">Winner</Badge>}
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
