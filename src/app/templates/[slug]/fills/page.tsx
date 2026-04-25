import FillHistoryClient from './FillHistoryClient';

export default async function FillHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <FillHistoryClient slug={slug} />;
}
