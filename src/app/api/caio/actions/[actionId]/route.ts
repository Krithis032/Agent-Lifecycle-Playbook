import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ actionId: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const { actionId } = await params;
    const body = await req.json();
    const action = await prisma.caioActionItem.update({
      where: { id: parseInt(actionId) },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.owner && { owner: body.owner }),
      },
    });
    return NextResponse.json(action);
  } catch (error) {
    logError('PATCH /api/caio/actions', error);
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
  }
}
