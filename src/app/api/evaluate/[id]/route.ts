import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateEvalWeightedScores } from '@/lib/scoring';
import type { EvalOption, EvalCriterion, EvalScore } from '@/types/evaluation';
import { logError } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const options = evaluation.options as unknown as EvalOption[];
    const criteria = evaluation.criteria as unknown as EvalCriterion[];
    const scores = evaluation.scores as unknown as EvalScore[];
    const weightedScores = calculateEvalWeightedScores(options, criteria, scores);

    return NextResponse.json({
      id: evaluation.id,
      projectId: evaluation.projectId,
      projectName: evaluation.project?.name || null,
      evalType: evaluation.evalType,
      title: evaluation.title,
      options,
      criteria,
      scores,
      recommendation: evaluation.recommendation,
      rationale: evaluation.rationale,
      createdAt: evaluation.createdAt.toISOString(),
      weightedScores,
    });
  } catch (err) {
    logError('GET /api/evaluate/[id]', err);
    return NextResponse.json({ error: 'Failed to fetch evaluation' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.evaluation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError('DELETE /api/evaluate/[id]', err);
    return NextResponse.json({ error: 'Failed to delete evaluation' }, { status: 500 });
  }
}
