import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const assessment = await prisma.governanceAssessment.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: { select: { id: true, name: true, status: true } },
        riskItems: { orderBy: { id: 'asc' } },
        whartonScores: { orderBy: { id: 'asc' } },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    logError('GET /api/governance/detail', error);
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
  }
}
