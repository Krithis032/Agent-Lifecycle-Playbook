import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logError } from '@/lib/logger';
import { validateFieldValuesSize } from '@/lib/safe-json';

export async function GET(
  _req: NextRequest,
  { params }: { params: { fillId: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const id = parseInt(params.fillId, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const fill = await prisma.templateFill.findUnique({
      where: { id },
      include: {
        template: { select: { slug: true, name: true, fields: true, description: true, phase: { select: { name: true } } } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!fill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(fill);
  } catch (err) {
    logError('GET /api/templates/fills/[id]', err);
    return NextResponse.json({ error: 'Failed to fetch fill' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { fillId: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const id = parseInt(params.fillId, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();

    // Validate fieldValues size before saving
    if (body.fieldValues && typeof body.fieldValues === 'object') {
      const sizeCheck = validateFieldValuesSize(body.fieldValues);
      if (!sizeCheck.valid) {
        return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
      }
    }

    const fill = await prisma.templateFill.update({
      where: { id },
      data: {
        title: body.title,
        fieldValues: body.fieldValues,
        projectId: body.projectId ?? undefined,
      },
    });
    return NextResponse.json(fill);
  } catch (err) {
    logError('PATCH /api/templates/fills/[id]', err);
    return NextResponse.json({ error: 'Failed to update fill' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { fillId: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const id = parseInt(params.fillId, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    await prisma.templateFill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError('DELETE /api/templates/fills/[id]', err);
    return NextResponse.json({ error: 'Failed to delete fill' }, { status: 500 });
  }
}
