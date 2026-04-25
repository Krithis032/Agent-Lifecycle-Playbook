import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const revalidate = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const concept = await prisma.kbConcept.findUnique({
    where: { id: parseInt(id, 10) },
    include: { domain: true },
  });
  if (!concept) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(concept);
}
