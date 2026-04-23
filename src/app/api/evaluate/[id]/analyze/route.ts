import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import prisma from '@/lib/prisma';
import { calculateEvalWeightedScores } from '@/lib/scoring';
import { getEvalAnalysis } from '@/lib/eval-analysis';
import type { EvalOption, EvalCriterion, EvalScore } from '@/types/evaluation';
import { logError } from '@/lib/logger';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const limited = rateLimit(_req, { maxRequests: 5, windowMs: 60_000, keyPrefix: 'eval-analyze' });
  if (limited) return limited;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { project: { select: { name: true } } },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const options = evaluation.options as unknown as EvalOption[];
    const criteria = evaluation.criteria as unknown as EvalCriterion[];
    const scores = evaluation.scores as unknown as EvalScore[];
    const weightedScores = calculateEvalWeightedScores(options, criteria, scores);

    const analysis = await getEvalAnalysis(
      evaluation.evalType,
      evaluation.title,
      weightedScores.map(ws => ({
        name: ws.optionName,
        totalScore: ws.totalScore,
        rank: ws.rank,
      })),
      criteria.map(c => ({ name: c.name, weight: c.weight })),
      evaluation.project?.name
    );

    return NextResponse.json(analysis);
  } catch (err) {
    logError('POST /api/evaluate/analyze', err);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
