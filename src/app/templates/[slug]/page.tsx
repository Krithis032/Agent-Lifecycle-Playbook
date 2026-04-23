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

export default async function TemplateFillPage({ params }: { params: { slug: string } }) {
  const template = await prisma.template.findUnique({
    where: { slug: params.slug },
    include: { phase: { select: { name: true } } },
  });

  if (!template) notFound();

  const fields = template.fields as unknown as FieldDef[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/templates" className="text-[13px] text-[var(--accent)] hover:underline flex items-center gap-1 mb-3">
          <ArrowLeft size={14} /> Back to Templates
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{template.name}</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">{template.description}</p>
      </div>
      <TemplateForm
        templateSlug={template.slug}
        templateName={template.name}
        fields={fields}
      />
    </div>
  );
}
