import CompareClient from './CompareClient';

export default async function ComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompareClient id={id} />;
}
