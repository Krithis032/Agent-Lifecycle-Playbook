import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const phases = await prisma.playbookPhase.findMany({
    include: {
      steps: { orderBy: { sortOrder: 'asc' } },
      gateChecks: true,
    },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(phases);
}
