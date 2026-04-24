import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDocx } from '@/lib/docx-export';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

interface TemplateField {
  key: string;
  label: string;
  type: string;
  section?: string;
  columns?: { key: string; header: string }[];
  subFields?: { key: string; label: string }[];
}

export async function POST(
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
      include: { template: { select: { name: true, fields: true } } },
    });
    if (!fill) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const fields = fill.template.fields as unknown as TemplateField[];
    const values = fill.fieldValues as Record<string, string>;

    // Group fields by section
    const sectionMap = new Map<string, {
      label: string;
      value: string;
      type: string;
      columns?: { key: string; header: string }[];
      subFields?: { key: string; label: string }[];
    }[]>();
    for (const field of fields) {
      const section = field.section || 'General';
      if (!sectionMap.has(section)) sectionMap.set(section, []);
      sectionMap.get(section)!.push({
        label: field.label,
        value: values[field.key] || '',
        type: field.type,
        columns: field.columns,
        subFields: field.subFields,
      });
    }

    const sections = Array.from(sectionMap.entries()).map(([sectionName, sFields]) => ({
      sectionName,
      fields: sFields,
    }));

    const buffer = await generateDocx(fill.template.name, fill.title, sections);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fill.title.replace(/[^a-zA-Z0-9 ]/g, '')}.docx"`,
      },
    });
  } catch (err) {
    logError('GET /api/templates/fills/export', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
