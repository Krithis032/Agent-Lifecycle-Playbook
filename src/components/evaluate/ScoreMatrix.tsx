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
          <tr className="bg-[var(--surface)]">
            <th className="text-left px-4 py-3 font-semibold text-[var(--text-3)] border-b border-[var(--border)] min-w-[180px]">
              Criterion
            </th>
            <th className="px-2 py-3 font-medium text-[var(--text-4)] border-b border-[var(--border)] text-center text-xs">
              Weight
            </th>
            {options.map(opt => (
              <th
                key={opt.key}
                className="px-4 py-3 font-semibold text-[var(--text)] border-b border-[var(--border)] text-center min-w-[160px]"
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
              <tr key={crit.key} className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text)]">{crit.name}</div>
                  {crit.description && (
                    <div className="text-xs text-[var(--text-4)] mt-0.5 max-w-[200px]">{crit.description}</div>
                  )}
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="text-xs font-bold text-[var(--accent)] tabular-nums">
                    {(crit.weight * 100).toFixed(0)}%
                  </span>
                </td>
                {options.map(opt => {
                  const score = getScore(opt.key, crit.key);
                  const isLeader = score > 0 && score === maxInRow && rowScores.filter(s => s === maxInRow).length === 1;
                  return (
                    <td
                      key={opt.key}
                      className={`px-4 py-3 text-center ${isLeader ? 'bg-[var(--success-soft)]' : ''}`}
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
          <tr className="bg-[var(--surface)]">
            <td className="px-4 py-3 font-bold text-[var(--text)]">Weighted Total</td>
            <td />
            {options.map(opt => {
              const t = totals.find(t => t.key === opt.key);
              const isMax = t && t.total === maxTotal && t.total > 0;
              return (
                <td key={opt.key} className="px-4 py-3 text-center">
                  <span className={`text-lg font-bold tabular-nums ${isMax ? 'text-[var(--success)]' : 'text-[var(--text)]'}`}>
                    {(t?.total || 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-[var(--text-4)]"> / 5.00</span>
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
