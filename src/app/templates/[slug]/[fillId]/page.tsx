import FillViewClient from './FillViewClient';

export default async function FillViewPage({ params }: { params: Promise<{ slug: string; fillId: string }> }) {
  const { slug, fillId } = await params;
  return <FillViewClient slug={slug} fillId={fillId} />;
}
