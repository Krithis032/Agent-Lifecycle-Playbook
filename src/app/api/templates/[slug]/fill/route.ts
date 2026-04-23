import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const template = await prisma.template.findUnique({ where: { slug: params.slug } });
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, fieldValues, projectId } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const fill = await prisma.templateFill.create({
      data: {
        templateId: template.id,
        projectId: projectId || null,
        title: title.trim(),
        fieldValues: fieldValues || {},
      },
    });

    return NextResponse.json(fill, { status: 201 });
  } catch (err) {
    logError('POST /api/templates/fill', err);
    return NextResponse.json({ error: 'Failed to create fill' }, { status: 500 });
  }
}
