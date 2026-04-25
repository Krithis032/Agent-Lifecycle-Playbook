import TemplateClient from './TemplateClient';

export default async function TemplateFillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TemplateClient slug={slug} />;
}
