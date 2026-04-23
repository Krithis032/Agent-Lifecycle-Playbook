'use client';

import Badge from '@/components/ui/Badge';
import { ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import type { EvalCriterion, EvalScore, WeightedScoreResult } from '@/types/evaluation';

interface ComparisonViewProps {
  results: WeightedScoreResult[];
  criteria: EvalCriterion[];
  scores: EvalScore[];
}

export default function ComparisonView({ results, criteria, scores }: ComparisonViewProps) {
  if (results.length < 2) return <p className="text-[var(--text-3)]">Need at least 2 options to compare.</p>;

  const a = results[0];
  const b = results[1];

  const getScore = (optKey: string, critKey: string) =>
    scores.find(s => s.optionKey === optKey && s.criterionKey === critKey)?.score || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-glow)] text-center">
          <Trophy size={20} className="mx-auto text-[var(--accent)] mb-2" />
          <div className="text-lg font-bold text-[var(--text)]">{a.optionName}</div>
          <div className="text-2xl font-bold text-[var(--accent)] mt-1 tabular-nums">{a.totalScore.toFixed(2)}</div>
          <Badge variant="accent" className="mt-2">#1 Recommended</Badge>
        </div>
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-active)] text-center">
          <div className="w-5 h-5 mx-auto mb-2" />
          <div className="text-lg font-bold text-[var(--text)]">{b.optionName}</div>
          <div className="text-2xl font-bold text-[var(--text-2)] mt-1 tabular-nums">{b.totalScore.toFixed(2)}</div>
          <Badge variant="default" className="mt-2">#2 Runner-up</Badge>
        </div>
      </div>

      {/* Per-criterion breakdown */}
      <div className="bg-[var(--surface-active)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
          <h3 className="text-[15px] font-semibold text-[var(--text)]">Criterion-by-Criterion Breakdown</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {criteria.map(crit => {
            const scoreA = getScore(a.optionKey, crit.key);
            const scoreB = getScore(b.optionKey, crit.key);
            const delta = scoreA - scoreB;
            const winner = delta > 0 ? 'a' : delta < 0 ? 'b' : 'tie';

            return (
              <div key={crit.key} className="flex items-center px-5 py-3 gap-4 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text)]">{crit.name}</div>
                  <div className="text-xs text-[var(--text-4)]">{(crit.weight * 100).toFixed(0)}% weight</div>
                </div>
                <div className={`w-10 text-center font-bold tabular-nums ${winner === 'a' ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}`}>
                  {scoreA}
                </div>
                <div className="w-16 text-center">
                  {delta !== 0 ? (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                      delta > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                    }`}>
                      {delta > 0 ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-4)]">Tie</span>
                  )}
                </div>
                <div className={`w-10 text-center font-bold tabular-nums ${winner === 'b' ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}`}>
                  {scoreB}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conditional guidance */}
      <div className="p-5 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
        <h3 className="text-[15px] font-semibold text-[var(--text)] mb-3">Conditional Guidance</h3>
        <div className="space-y-2 text-sm text-[var(--text-2)]">
          {criteria.map(crit => {
            const scoreA = getScore(a.optionKey, crit.key);
            const scoreB = getScore(b.optionKey, crit.key);
            if (scoreB <= scoreA) return null;
            return (
              <p key={crit.key}>
                → If you value <strong>{crit.name}</strong> more than the current {(crit.weight * 100).toFixed(0)}% weight,
                consider <strong>{b.optionName}</strong> (scores {scoreB} vs {scoreA}).
              </p>
            );
          })}
          {criteria.every(c => getScore(a.optionKey, c.key) >= getScore(b.optionKey, c.key)) && (
            <p className="text-[var(--success)]">
              {a.optionName} leads or ties on every criterion — a clear winner.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
