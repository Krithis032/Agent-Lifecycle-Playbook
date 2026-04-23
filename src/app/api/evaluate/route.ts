import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateEvalWeightedScores, generateRecommendation } from '@/lib/scoring';
import { logError } from '@/lib/logger';
import type { EvalOption, EvalCriterion, EvalScore } from '@/types/evaluation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const evaluations = await prisma.evaluation.findMany({
      take: 100,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = evaluations.map(e => {
      const options = e.options as unknown as EvalOption[];
      const criteria = e.criteria as unknown as EvalCriterion[];
      const scores = e.scores as unknown as EvalScore[];
      const weightedScores = calculateEvalWeightedScores(options, criteria, scores);

      return {
        id: e.id,
        projectId: e.projectId,
        projectName: e.project?.name || null,
        evalType: e.evalType,
        title: e.title,
        options,
        criteria,
        scores,
        recommendation: e.recommendation,
        rationale: e.rationale,
        createdAt: e.createdAt.toISOString(),
        weightedScores,
      };
    });

    return NextResponse.json(mapped);
  } catch (err) {
    logError('GET /api/evaluate', err);
    return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { projectId, evalType, title, options, criteria, scores } = body;

    if (!evalType || !title || !options?.length || !criteria?.length || !scores?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const weightedScores = calculateEvalWeightedScores(options, criteria, scores);
    const { recommendation, rationale } = generateRecommendation(weightedScores);

    const evaluation = await prisma.evaluation.create({
      data: {
        projectId: projectId || null,
        evalType,
        title,
        options,
        criteria,
        scores,
        recommendation,
        rationale,
      },
    });

    return NextResponse.json({
      ...evaluation,
      createdAt: evaluation.createdAt.toISOString(),
      weightedScores,
    }, { status: 201 });
  } catch (err) {
    logError('POST /api/evaluate', err);
    return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 });
  }
}
