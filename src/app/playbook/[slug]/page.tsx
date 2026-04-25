import PhaseDetailClient from './PhaseDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PhaseDetailPage({ params }: Props) {
  const { slug } = await params;
  return <PhaseDetailClient slug={slug} />;
}
