'use client';

import { useState, useEffect } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TemplateForm from '@/components/templates/TemplateForm';
import { ArrowLeft } from 'lucide-react';

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

interface Template {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  fields: unknown;
  phase: { name: string } | null;
}

interface Fill {
  id: number;
  title: string;
  fieldValues: Record<string, string>;
  templateId: number;
}

export default function TemplateClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [template, setTemplate] = useState<Template | null>(null);
  const [existingFill, setExistingFill] = useState<{ id: number; title: string; fieldValues: Record<string, string> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    fetch(`/api/templates/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setTemplate(data);

        // If editing, fetch the fill data
        if (editId) {
          const fillId = parseInt(editId, 10);
          if (!isNaN(fillId)) {
            return fetch(`/api/templates/fills/${fillId}`)
              .then(res => res.json())
              .then((fill: Fill) => {
                if (fill.templateId === data.id) {
                  setExistingFill({
                    id: fill.id,
                    title: fill.title,
                    fieldValues: fill.fieldValues,
                  });
                }
                setLoading(false);
              });
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch template:', err);
        setNotFoundError(true);
        setLoading(false);
      });
  }, [slug, editId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="h-96 bg-[var(--surface-1)] rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  if (notFoundError || !template) {
    notFound();
  }

  const fields = template.fields as unknown as FieldDef[];

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div>
        <Link href="/templates" className="text-[13px] hover:underline flex items-center gap-1 mb-3" style={{ color: 'var(--brand-primary)' }}>
          <ArrowLeft size={14} /> Back to Templates
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {existingFill ? `Edit: ${existingFill.title}` : template.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{template.description}</p>
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
