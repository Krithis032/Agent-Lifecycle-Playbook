import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { generateCaioAssessment } from '@/lib/caio-assessment';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';

export const maxDuration = 60; // Allow longer for Opus calls

export async function POST(req: NextRequest) {
  const [session, authError] = await requireAuth();
  if (authError) return authError;

  const limited = rateLimit(req, { maxRequests: 5, windowMs: 60_000, keyPrefix: 'caio-assess' });
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      projectId,
      initiativeName,
      assessmentMode,
      domainScores,
      targetMaturity,
    } = body;

    // Step 1: Call Claude Opus to generate findings
    let generated;
    try {
      generated = await generateCaioAssessment(
        initiativeName,
        domainScores.map((d: Record<string, unknown>) => ({
          domainKey: d.domainKey,
          domainName: d.domainName,
          score: d.score,
          evidence: d.currentState || '',
          gaps: d.gaps || [],
        })),
        body.projectContext
      );
    } catch (err) {
      logError('POST /api/caio/assess (rate)', err);
      const avgScore = domainScores.reduce((s: number, d: { score: number }) => s + d.score, 0) / domainScores.length;
      generated = {
        executiveSummary: 'Assessment completed without AI-generated insights. Review domain scores manually.',
        maturityLevel: Math.round(avgScore),
        maturityLabel: ['', 'Ad Hoc', 'Initial', 'Defined', 'Managed', 'Optimized'][Math.round(avgScore)] || 'Initial',
        findings: [],
        actionItems: [],
      };
    }

    // Step 2: Calculate overall score
    const avgScore = domainScores.reduce((s: number, d: { score: number }) => s + d.score, 0) / domainScores.length;
    const overallNormalized = avgScore / 5;
    const riskClass = overallNormalized >= 0.8 ? 'low' : overallNormalized >= 0.6 ? 'medium' : overallNormalized >= 0.4 ? 'high' : 'critical';

    // Step 3: Save to DB
    const assessment = await prisma.caioAssessment.create({
      data: {
        projectId: projectId || null,
        initiativeName,
        assessmentMode: assessmentMode || 'audit',
        overallScore: overallNormalized,
        maturityLevel: generated.maturityLevel,
        maturityLabel: generated.maturityLabel,
        targetMaturity: targetMaturity || null,
        riskClassification: riskClass,
        executiveSummary: generated.executiveSummary,
        assessor: session.user.name || session.user.email,
      },
    });

    // Step 4: Save domain scores
    if (domainScores.length > 0) {
      await prisma.caioDomainScore.createMany({
        data: domainScores.map((d: Record<string, unknown>) => ({
          assessmentId: assessment.id,
          domainKey: d.domainKey as string,
          domainName: d.domainName as string,
          score: (d.score as number) / 5, // Normalize to 0-1
          riskLevel: (d.score as number) >= 4 ? 'low' : (d.score as number) >= 3 ? 'medium' : (d.score as number) >= 2 ? 'high' : 'critical',
          currentState: d.currentState as unknown as Prisma.InputJsonValue,
          gaps: d.gaps as unknown as Prisma.InputJsonValue,
          actions: d.actions as unknown as Prisma.InputJsonValue,
          questionScores: d.questionScores as unknown as Prisma.InputJsonValue,
        })),
      });
    }

    // Step 5: Save findings
    if (generated.findings?.length > 0) {
      await prisma.caioFinding.createMany({
        data: generated.findings.map((f: Record<string, string>) => ({
          assessmentId: assessment.id,
          domainKey: f.domainKey,
          severity: f.severity,
          title: f.title,
          finding: f.finding,
          rationale: f.rationale || null,
          frameworkRef: f.frameworkRef || null,
        })),
      });
    }

    // Step 6: Save action items
    if (generated.actionItems?.length > 0) {
      await prisma.caioActionItem.createMany({
        data: generated.actionItems.map((a: Record<string, string>) => ({
          assessmentId: assessment.id,
          phase: a.phase,
          domainKey: a.domainKey,
          action: a.action,
          frameworkRef: a.frameworkRef || null,
          owner: a.owner || null,
          status: 'pending',
        })),
      });
    }

    return NextResponse.json({
      ...assessment,
      generated,
    }, { status: 201 });
  } catch (error) {
    logError('POST /api/caio/assess', error);
    return NextResponse.json({ error: 'Failed to create CAIO assessment' }, { status: 500 });
  }
}
