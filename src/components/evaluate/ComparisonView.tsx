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
  if (results.length < 2) return <p style={{ color: 'var(--text-tertiary)' }}>Need at least 2 options to compare.</p>;

  const a = results[0];
  const b = results[1];

  const getScore = (optKey: string, critKey: string) =>
    scores.find(s => s.optionKey === optKey && s.criterionKey === critKey)?.score || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl text-center" style={{ border: '2px solid var(--brand-primary)', background: 'var(--brand-soft)' }}>
          <Trophy size={20} className="mx-auto mb-2" style={{ color: 'var(--brand-primary)' }} />
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{a.optionName}</div>
          <div className="text-2xl font-bold mt-1 tabular-nums" style={{ color: 'var(--brand-primary)' }}>{a.totalScore.toFixed(2)}</div>
          <Badge variant="brand" className="mt-2">#1 Recommended</Badge>
        </div>
        <div className="p-5 rounded-xl text-center" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
          <div className="w-5 h-5 mx-auto mb-2" />
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{b.optionName}</div>
          <div className="text-2xl font-bold mt-1 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{b.totalScore.toFixed(2)}</div>
          <Badge variant="default" className="mt-2">#2 Runner-up</Badge>
        </div>
      </div>

      {/* Per-criterion breakdown */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
        <div className="px-5 py-3" style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border-default)' }}>
          <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Criterion-by-Criterion Breakdown</h3>
        </div>
        <div>
          {criteria.map((crit, i) => {
            const scoreA = getScore(a.optionKey, crit.key);
            const scoreB = getScore(b.optionKey, crit.key);
            const delta = scoreA - scoreB;
            const winner = delta > 0 ? 'a' : delta < 0 ? 'b' : 'tie';

            return (
              <div
                key={crit.key}
                className="flex items-center px-5 py-3 gap-4 text-sm"
                style={{ borderBottom: i < criteria.length - 1 ? '1px solid var(--border-default)' : undefined }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{crit.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{(crit.weight * 100).toFixed(0)}% weight</div>
                </div>
                <div
                  className="w-10 text-center font-bold tabular-nums"
                  style={{ color: winner === 'a' ? 'var(--module-evaluate)' : 'var(--text-tertiary)' }}
                >
                  {scoreA}
                </div>
                <div className="w-16 text-center">
                  {delta !== 0 ? (
                    <span
                      className="inline-flex items-center gap-0.5 text-xs font-bold"
                      style={{ color: delta > 0 ? 'var(--status-success)' : 'var(--status-error)' }}
                    >
                      {delta > 0 ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>Tie</span>
                  )}
                </div>
                <div
                  className="w-10 text-center font-bold tabular-nums"
                  style={{ color: winner === 'b' ? 'var(--module-evaluate)' : 'var(--text-tertiary)' }}
                >
                  {scoreB}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conditional guidance */}
      <div className="p-5 rounded-xl" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
        <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Conditional Guidance</h3>
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
            <p style={{ color: 'var(--status-success)' }}>
              {a.optionName} leads or ties on every criterion — a clear winner.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
