import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { calculateEvalWeightedScores } from '@/lib/scoring';
import type { EvalOption, EvalCriterion, EvalScore } from '@/types/evaluation';
import EvalDetailClient from './EvalDetailClient';
import { ArrowLeft, GitCompare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!evaluation) notFound();

  const options = evaluation.options as unknown as EvalOption[];
  const criteria = evaluation.criteria as unknown as EvalCriterion[];
  const scores = evaluation.scores as unknown as EvalScore[];
  const weightedScores = calculateEvalWeightedScores(options, criteria, scores);

  const typeBadge: Record<string, { v: 'brand' | 'success' | 'info' | 'warning'; l: string }> = {
    framework: { v: 'brand', l: 'Framework' },
    architecture: { v: 'success', l: 'Architecture' },
    model_tier: { v: 'info', l: 'Preset' },
    custom: { v: 'warning', l: 'Custom' },
  };
  const tb = typeBadge[evaluation.evalType] || { v: 'brand' as const, l: evaluation.evalType };

  return (
    <div className="animate-fade-in flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/evaluate" className="text-[13px] flex items-center gap-1 mb-3" style={{ color: 'var(--module-evaluate)' }}>
            <ArrowLeft size={14} /> Back to Evaluations
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{evaluation.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={tb.v}>{tb.l}</Badge>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{new Date(evaluation.createdAt).toLocaleDateString()}</span>
            {evaluation.project && (
              <Link href={`/projects/${evaluation.project.id}`} className="text-sm" style={{ color: 'var(--module-evaluate)' }}>
                {evaluation.project.name}
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/evaluate/${id}/compare`}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <GitCompare size={14} /> Compare
          </Link>
        </div>
      </div>

      {/* Client-side charts + analysis */}
      <EvalDetailClient
        evalId={id}
        criteria={criteria}
        scores={scores}
        weightedScores={weightedScores}
        recommendation={evaluation.recommendation || ''}
        rationale={evaluation.rationale || ''}
      />

      {/* Score Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Full Score Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--surface-1)' }}>
              <tr>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Criterion</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Weight</th>
                {options.map(o => (
                  <th key={o.key} className="px-4 py-3 font-semibold text-center" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-default)' }}>
                    {o.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map(c => {
                const rowScores = options.map(o => scores.find(s => s.optionKey === o.key && s.criterionKey === c.key)?.score || 0);
                const maxInRow = Math.max(...rowScores);
                return (
                  <tr key={c.key} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</td>
                    <td className="px-3 py-3 text-center text-xs font-bold" style={{ color: 'var(--module-evaluate)' }}>{(c.weight * 100).toFixed(0)}%</td>
                    {options.map((o, i) => {
                      const s = rowScores[i];
                      const isLeader = s === maxInRow && s > 0 && rowScores.filter(x => x === maxInRow).length === 1;
                      return (
                        <td key={o.key} className="px-4 py-3 text-center font-bold tabular-nums" style={{
                          color: isLeader ? 'var(--status-success)' : 'var(--text-primary)',
                          background: isLeader ? 'var(--status-success-soft)' : undefined,
                        }}>
                          {s || '—'}
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
                {weightedScores.map(ws => (
                  <td key={ws.optionKey} className="px-4 py-3 text-center">
                    <span className="text-lg font-bold tabular-nums" style={{ color: ws.rank === 1 ? 'var(--status-success)' : 'var(--text-primary)' }}>
                      {ws.totalScore.toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
