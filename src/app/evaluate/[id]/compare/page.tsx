import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { calculateEvalWeightedScores } from '@/lib/scoring';
import ComparisonView from '@/components/evaluate/ComparisonView';
import type { EvalOption, EvalCriterion, EvalScore } from '@/types/evaluation';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ComparisonPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const evaluation = await prisma.evaluation.findUnique({ where: { id } });
  if (!evaluation) notFound();

  const options = evaluation.options as unknown as EvalOption[];
  const criteria = evaluation.criteria as unknown as EvalCriterion[];
  const scores = evaluation.scores as unknown as EvalScore[];
  const results = calculateEvalWeightedScores(options, criteria, scores);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/evaluate/${id}`} className="text-[13px] text-[var(--accent)] hover:underline flex items-center gap-1 mb-3">
          <ArrowLeft size={14} /> Back to Evaluation
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
          Side-by-Side Comparison
        </h1>
        <p className="text-sm text-[var(--text-3)] mt-1">{evaluation.title}</p>
      </div>
      <ComparisonView results={results} criteria={criteria} scores={scores} />
    </div>
  );
}
