import EvaluateDetailClientWrapper from './EvaluateDetailClient';

export default async function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EvaluateDetailClientWrapper id={id} />;
}
