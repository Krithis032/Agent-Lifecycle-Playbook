import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDocx } from '@/lib/docx-export';
import { generateProjectPdf } from '@/lib/pdf-export';
import { generateProjectPptx } from '@/lib/pptx-export';
import { requireAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export const revalidate = 30;

interface TemplateField {
  key: string;
  label: string;
  type: string;
  section?: string;
  columns?: { key: string; header: string }[];
  subFields?: { key: string; label: string }[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fillId: string; format: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const { fillId, format } = await params;
  const id = parseInt(fillId, 10);
  if (isNaN(id) || !['pdf', 'pptx', 'docx'].includes(format)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  try {
    const fill = await prisma.templateFill.findUnique({
      where: { id },
      include: { template: { select: { name: true, fields: true } } },
    });
    if (!fill) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const fields = fill.template.fields as unknown as TemplateField[];
    const values = fill.fieldValues as Record<string, string>;
    const safeName = fill.title.replace(/[^a-zA-Z0-9 ]/g, '');

    if (format === 'docx') {
      // Group fields by section for DOCX
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
      const docxSections = Array.from(sectionMap.entries()).map(([sectionName, sFields]) => ({
        sectionName,
        fields: sFields,
      }));

      const buffer = await generateDocx(fill.template.name, fill.title, docxSections);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeName}.docx"`,
        },
      });
    }

    // For PDF and PPTX, build sections in the same format as project export
    const sections: { title: string; items: { label: string; value: string; type?: string; columns?: { key: string; header: string }[]; subFields?: { key: string; label: string }[] }[] }[] = [];

    // Group by section
    const sectionMap = new Map<string, typeof fields>();
    for (const field of fields) {
      const section = field.section || 'General';
      if (!sectionMap.has(section)) sectionMap.set(section, []);
      sectionMap.get(section)!.push(field);
    }

    for (const [sectionName, sectionFields] of Array.from(sectionMap.entries())) {
      sections.push({
        title: sectionName,
        items: sectionFields.map((f: TemplateField) => ({
          label: f.label,
          value: values[f.key] || '',
          type: f.type,
          columns: f.columns,
          subFields: f.subFields,
        })),
      });
    }

    const meta = {
      status: 'completed',
      framework: fill.template.name,
      createdAt: new Date(fill.updatedAt).toLocaleDateString(),
    };

    if (format === 'pdf') {
      const buffer = generateProjectPdf(fill.title, `Template: ${fill.template.name}`, sections, meta);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${safeName}.pdf"`,
        },
      });
    } else {
      const buffer = await generateProjectPptx(fill.title, `Template: ${fill.template.name}`, sections, meta);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${safeName}.pptx"`,
        },
      });
    }
  } catch (err) {
    logError('GET /api/templates/fills/export/[format]', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
