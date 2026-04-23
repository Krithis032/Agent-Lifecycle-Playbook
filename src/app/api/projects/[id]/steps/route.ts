import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/projects/:id/steps — all step progress for a project
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    const progress = await prisma.projectStepProgress.findMany({
      where: { projectId },
      include: { step: { select: { id: true, stepNum: true, title: true, phaseId: true } } },
      orderBy: { step: { sortOrder: 'asc' } },
    });
    return NextResponse.json(progress);
  } catch (error) {
    logError('GET /api/projects/steps', error);
    return NextResponse.json({ error: 'Failed to fetch step progress' }, { status: 500 });
  }
}

// PATCH /api/projects/:id/steps — upsert step progress
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    const { stepId, status, notes, deliverableData } = await req.json();

    if (!stepId) return NextResponse.json({ error: 'stepId required' }, { status: 400 });

    const existing = await prisma.projectStepProgress.findFirst({
      where: { projectId, stepId },
    });

    const now = new Date();
    const data: Record<string, unknown> = {};
    if (status !== undefined) {
      data.status = status;
      if (status === 'in_progress' && !existing?.startedAt) data.startedAt = now;
      if (status === 'completed') data.completedAt = now;
      if (status === 'not_started') { data.startedAt = null; data.completedAt = null; }
    }
    if (notes !== undefined) data.notes = notes;
    if (deliverableData !== undefined) data.deliverableData = deliverableData;

    let record;
    if (existing) {
      record = await prisma.projectStepProgress.update({
        where: { id: existing.id },
        data,
      });
    } else {
      record = await prisma.projectStepProgress.create({
        data: {
          projectId,
          stepId,
          status: status || 'not_started',
          notes: notes || null,
          deliverableData: deliverableData || undefined,
          startedAt: status === 'in_progress' ? now : null,
          completedAt: status === 'completed' ? now : null,
        },
      });
    }

    return NextResponse.json(record);
  } catch (error) {
    logError('PATCH /api/projects/steps', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
