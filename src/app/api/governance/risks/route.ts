import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    const risk = await prisma.riskItem.create({
      data: {
        assessmentId: body.assessmentId,
        category: body.category,
        severity: body.severity,
        title: body.title,
        description: body.description || null,
        mitigation: body.mitigation || null,
        status: 'open',
      },
    });
    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    logError('POST /api/governance/risks', error);
    return NextResponse.json({ error: 'Failed to create risk item' }, { status: 500 });
  }
}
