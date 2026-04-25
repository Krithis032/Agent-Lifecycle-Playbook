import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const revalidate = 30;

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const fills = await prisma.templateFill.findMany({
      take: 100,
      select: {
        id: true,
        templateId: true,
        projectId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        template: { select: { slug: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(fills);
  } catch (err) {
    logError('GET /api/templates/fills', err);
    return NextResponse.json({ error: 'Failed to fetch fills' }, { status: 500 });
  }
}
