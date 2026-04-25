'use client';

import ScoreCell from './ScoreCell';
import type { EvalOption, EvalCriterion, EvalScore } from '@/types/evaluation';

interface ScoreMatrixProps {
  options: EvalOption[];
  criteria: EvalCriterion[];
  scores: EvalScore[];
  onChange: (scores: EvalScore[]) => void;
}

export default function ScoreMatrix({ options, criteria, scores, onChange }: ScoreMatrixProps) {
  const getScore = (optKey: string, critKey: string) => {
    return scores.find(s => s.optionKey === optKey && s.criterionKey === critKey)?.score || 0;
  };

  const setScore = (optKey: string, critKey: string, score: number) => {
    const existing = scores.filter(s => !(s.optionKey === optKey && s.criterionKey === critKey));
    onChange([...existing, { optionKey: optKey, criterionKey: critKey, score }]);
  };

  // Calculate weighted totals per option
  const totals = options.map(opt => {
    const total = criteria.reduce((sum, crit) => {
      const s = getScore(opt.key, crit.key);
      return sum + s * crit.weight;
    }, 0);
    return { key: opt.key, total };
  });

  const maxTotal = Math.max(...totals.map(t => t.total), 0.01);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--surface-1)' }}>
            <th className="text-left px-4 py-3 font-semibold min-w-[180px]" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)' }}>
              Criterion
            </th>
            <th className="px-2 py-3 font-medium text-center text-xs" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>
              Weight
            </th>
            {options.map(opt => (
              <th
                key={opt.key}
                className="px-4 py-3 font-semibold text-center min-w-[160px]"
                style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}
              >
                {opt.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map(crit => {
            const rowScores = options.map(opt => getScore(opt.key, crit.key));
            const maxInRow = Math.max(...rowScores, 0);
            return (
              <tr key={crit.key} style={{ borderBottom: '1px solid var(--border-default)' }}>
                <td className="px-4 py-3">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{crit.name}</div>
                  {crit.description && (
                    <div className="text-xs mt-0.5 max-w-[200px]" style={{ color: 'var(--text-quaternary)' }}>{crit.description}</div>
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--module-evaluate)' }}>
                    {(crit.weight * 100).toFixed(0)}%
                  </span>
                </td>
                {options.map(opt => {
                  const score = getScore(opt.key, crit.key);
                  const isLeader = score > 0 && score === maxInRow && rowScores.filter(s => s === maxInRow).length === 1;
                  return (
                    <td
                      key={opt.key}
                      className="px-4 py-3 text-center"
                      style={{ background: isLeader ? 'var(--status-success-soft)' : undefined }}
                    >
                      <div className="flex justify-center">
                        <ScoreCell score={score} onChange={v => setScore(opt.key, crit.key, v)} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: 'var(--surface-1)' }}>
            <td className="px-4 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>Weighted Total</td>
            <td />
            {options.map(opt => {
              const t = totals.find(t => t.key === opt.key);
              const isMax = t && t.total === maxTotal && t.total > 0;
              return (
                <td key={opt.key} className="px-4 py-3 text-center">
                  <span className="text-lg font-bold tabular-nums" style={{ color: isMax ? 'var(--status-success)' : 'var(--text-primary)' }}>
                    {(t?.total || 0).toFixed(2)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}> / 5.00</span>
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
