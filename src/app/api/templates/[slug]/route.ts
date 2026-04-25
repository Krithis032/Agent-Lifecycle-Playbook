import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const revalidate = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const template = await prisma.template.findUnique({
      where: { slug: params.slug },
      include: { phase: { select: { id: true, name: true, slug: true, phaseNum: true } } },
    });
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (err) {
    logError('GET /api/templates/[slug]', err);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}
