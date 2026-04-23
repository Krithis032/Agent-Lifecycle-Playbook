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
    const body = await req.json();
    const risk = await prisma.riskItem.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.mitigation !== undefined && { mitigation: body.mitigation }),
        ...(body.severity && { severity: body.severity }),
      },
    });
    return NextResponse.json(risk);
  } catch (error) {
    logError('PATCH /api/governance/risks/[id]', error);
    return NextResponse.json({ error: 'Failed to update risk item' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.riskItem.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('DELETE /api/governance/risks/[id]', error);
    return NextResponse.json({ error: 'Failed to delete risk item' }, { status: 500 });
  }
}
