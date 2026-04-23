import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const { slug } = await params;
  const phase = await prisma.playbookPhase.findUnique({
    where: { slug },
    include: {
      steps: { orderBy: { sortOrder: 'asc' } },
      gateChecks: true,
    },
  });
  if (!phase) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(phase);
}
