import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const revalidate = 30;

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const assessments = await prisma.caioAssessment.findMany({
      take: 100,
      include: {
        project: { select: { id: true, name: true } },
        domainScores: { select: { id: true, domainKey: true, score: true } },
      },
      orderBy: { assessedAt: 'desc' },
    });
    return NextResponse.json(assessments);
  } catch (error) {
    logError('GET /api/caio', error);
    return NextResponse.json({ error: 'Failed to list assessments' }, { status: 500 });
  }
}
