import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// PATCH /api/projects/:id/phases — advance or update phase progress
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    const { phaseId, status } = await req.json();

    if (!phaseId || !status) {
      return NextResponse.json({ error: 'phaseId and status required' }, { status: 400 });
    }

    const now = new Date();
    const existing = await prisma.projectPhaseProgress.findFirst({
      where: { projectId, phaseId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Phase progress not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === 'in_progress' && !existing.startedAt) updateData.startedAt = now;
    if (status === 'completed') updateData.completedAt = now;

    await prisma.projectPhaseProgress.update({
      where: { id: existing.id },
      data: updateData,
    });

    // If completing a phase, advance currentPhaseId to the next phase
    if (status === 'completed') {
      const currentPhase = await prisma.playbookPhase.findUnique({ where: { id: phaseId } });
      if (currentPhase) {
        const nextPhase = await prisma.playbookPhase.findFirst({
          where: { sortOrder: { gt: currentPhase.sortOrder } },
          orderBy: { sortOrder: 'asc' },
        });
        if (nextPhase) {
          await prisma.project.update({
            where: { id: projectId },
            data: { currentPhaseId: nextPhase.id },
          });
          // Start the next phase
          await prisma.projectPhaseProgress.updateMany({
            where: { projectId, phaseId: nextPhase.id },
            data: { status: 'in_progress', startedAt: now },
          });
        }
      }
    }

    // If starting a phase, set it as current
    if (status === 'in_progress') {
      await prisma.project.update({
        where: { id: projectId },
        data: { currentPhaseId: phaseId },
      });
    }

    // Fetch updated project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        currentPhase: true,
        phaseProgress: {
          include: { phase: { select: { id: true, phaseNum: true, name: true, slug: true, icon: true } } },
          orderBy: { phase: { sortOrder: 'asc' } },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    logError('PATCH /api/projects/phases', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
