import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logError } from '@/lib/logger';

export const revalidate = 30;

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const templates = await prisma.template.findMany({
      take: 200,
      include: {
        phase: { select: { id: true, name: true, slug: true, phaseNum: true } },
        _count: { select: { fills: true } },
      },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(templates.map(t => ({
      ...t,
      fillCount: t._count.fills,
      _count: undefined,
    })));
  } catch (err) {
    logError('GET /api/templates', err);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
