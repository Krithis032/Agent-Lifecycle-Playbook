import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const [
      projects,
      evaluations,
      assessments,
      caioAssessments,
      templateFills,
      riskItems,
      templates,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.evaluation.count(),
      prisma.governanceAssessment.count(),
      prisma.caioAssessment.count(),
      prisma.templateFill.count(),
      prisma.riskItem.count({ where: { status: 'open' } }),
      prisma.template.count(),
    ]);

    return NextResponse.json({
      projects,
      evaluations,
      assessments,
      caioAssessments,
      templateFills,
      openRisks: riskItems,
      templates,
    });
  } catch (err) {
    logError('GET /api/dashboard/stats', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
