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

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId) || projectId < 1) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        currentPhase: true,
        phaseProgress: {
          include: { phase: { select: { id: true, phaseNum: true, name: true, slug: true, icon: true } } },
          orderBy: { phase: { sortOrder: 'asc' } },
        },
        gateChecks: { include: { gateCheck: true } },
        stepProgress: { include: { step: { select: { id: true, stepNum: true, title: true, phaseId: true } } } },
        templateFills: { include: { template: { select: { id: true, slug: true, name: true, phaseId: true } } }, orderBy: { updatedAt: 'desc' } },
        governance: { take: 5, orderBy: { assessedAt: 'desc' } },
        evaluations: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    logError('GET /api/projects/[id]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (isNaN(projectId) || projectId < 1) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Only allow specific fields to prevent mass assignment
    const allowedFields = ['name', 'description', 'architecturePattern', 'framework', 'modelStrategy', 'status', 'notes'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });
    return NextResponse.json(project);
  } catch (error) {
    logError('PATCH /api/projects/[id]', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
