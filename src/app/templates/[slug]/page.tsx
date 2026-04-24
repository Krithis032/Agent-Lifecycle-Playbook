import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TemplateForm from '@/components/templates/TemplateForm';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  section?: string;
}

export default async function TemplateFillPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { edit?: string };
}) {
  const template = await prisma.template.findUnique({
    where: { slug: params.slug },
    include: { phase: { select: { name: true } } },
  });

  if (!template) notFound();

  const fields = template.fields as unknown as FieldDef[];

  // If editing an existing fill, load its data
  let existingFill: { id: number; title: string; fieldValues: Record<string, string> } | null = null;
  if (searchParams.edit) {
    const fillId = parseInt(searchParams.edit, 10);
    if (!isNaN(fillId)) {
      const fill = await prisma.templateFill.findUnique({
        where: { id: fillId },
        select: { id: true, title: true, fieldValues: true, templateId: true },
      });
      if (fill && fill.templateId === template.id) {
        existingFill = {
          id: fill.id,
          title: fill.title,
          fieldValues: fill.fieldValues as Record<string, string>,
        };
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/templates" className="text-[13px] text-[var(--accent)] hover:underline flex items-center gap-1 mb-3">
          <ArrowLeft size={14} /> Back to Templates
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
          {existingFill ? `Edit: ${existingFill.title}` : template.name}
        </h1>
        <p className="text-sm text-[var(--text-3)] mt-1">{template.description}</p>
      </div>
      <TemplateForm
        templateSlug={template.slug}
        templateName={template.name}
        fields={fields}
        initialValues={existingFill?.fieldValues}
        initialTitle={existingFill?.title}
        fillId={existingFill?.id}
      />
    </div>
  );
}
