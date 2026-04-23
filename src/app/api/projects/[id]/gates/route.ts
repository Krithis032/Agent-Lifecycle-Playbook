import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    const { gateCheckId, itemIndex, checked } = await req.json();

    // Upsert the gate check record
    const existing = await prisma.projectGateCheck.findFirst({
      where: { projectId, gateCheckId, itemIndex },
    });

    if (existing) {
      await prisma.projectGateCheck.update({
        where: { id: existing.id },
        data: { checked, checkedAt: checked ? new Date() : null },
      });
    } else {
      await prisma.projectGateCheck.create({
        data: {
          projectId,
          gateCheckId,
          itemIndex,
          checked,
          checkedAt: checked ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('PATCH /api/projects/gates', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
