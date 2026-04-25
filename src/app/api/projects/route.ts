import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const projects = await prisma.project.findMany({
      take: 100,
      include: {
        currentPhase: { select: { id: true, name: true, slug: true, icon: true } },
        phaseProgress: { include: { phase: { select: { phaseNum: true, name: true, icon: true } } } },
        gateChecks: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    logError('GET /api/projects', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, description, architecturePattern, framework, modelStrategy } = body;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    // Get first phase for default
    const firstPhase = await prisma.playbookPhase.findFirst({ orderBy: { sortOrder: 'asc' } });
    const allPhases = await prisma.playbookPhase.findMany({ orderBy: { sortOrder: 'asc' } });

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        architecturePattern: architecturePattern || null,
        framework: framework || null,
        modelStrategy: modelStrategy || undefined,
        currentPhaseId: firstPhase?.id || null,
        phaseProgress: {
          create: allPhases.map((phase) => ({
            phaseId: phase.id,
            status: phase.id === firstPhase?.id ? 'in_progress' : 'not_started',
            startedAt: phase.id === firstPhase?.id ? new Date() : null,
          })),
        },
      },
      include: {
        currentPhase: true,
        phaseProgress: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    logError('POST /api/projects', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
