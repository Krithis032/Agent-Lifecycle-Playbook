import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const assessments = await prisma.governanceAssessment.findMany({
      take: 100,
      include: {
        project: { select: { id: true, name: true, status: true } },
        riskItems: { select: { id: true, severity: true, status: true } },
      },
      orderBy: { assessedAt: 'desc' },
    });
    return NextResponse.json(assessments);
  } catch (error) {
    logError('GET /api/governance/assess', error);
    return NextResponse.json({ error: 'Failed to list assessments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const [session, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      projectId,
      assessmentType,
      trustLayerScores,
      whartonDomains,
      complianceChecks,
      riskClassification,
      riskItems,
      overallScore,
      notes,
    } = body;

    const assessment = await prisma.governanceAssessment.create({
      data: {
        projectId,
        assessmentType: assessmentType || 'initial',
        trustLayerScores: trustLayerScores as unknown as Prisma.InputJsonValue,
        riskClassification,
        complianceStatus: complianceChecks as unknown as Prisma.InputJsonValue,
        overallScore,
        assessor: session.user.name || session.user.email,
        notes: notes || null,
      },
    });

    // Create Wharton domain scores
    if (whartonDomains && whartonDomains.length > 0) {
      await prisma.whartonDomainScore.createMany({
        data: whartonDomains.map((d: Record<string, unknown>) => ({
          assessmentId: assessment.id,
          domainKey: d.domainKey as string,
          domainName: d.domainName as string,
          score: d.overallScore as number,
          riskLevel: d.riskLevel as string,
          currentState: d.currentState as unknown as Prisma.InputJsonValue,
          gaps: d.gaps as unknown as Prisma.InputJsonValue,
          actions: d.actions as unknown as Prisma.InputJsonValue,
          questionScores: d.questions as unknown as Prisma.InputJsonValue,
        })),
      });
    }

    // Create risk items
    if (riskItems && riskItems.length > 0) {
      await prisma.riskItem.createMany({
        data: riskItems.map((r: Record<string, string>) => ({
          assessmentId: assessment.id,
          category: r.category,
          severity: r.severity,
          title: r.title,
          description: r.description || null,
          mitigation: r.mitigation || null,
          status: 'open',
        })),
      });
    }

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    logError('POST /api/governance/assess', error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
