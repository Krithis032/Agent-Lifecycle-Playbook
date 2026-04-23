import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BookOpen, Link2, TrendingUp } from 'lucide-react';

interface ConceptCardProps {
  conceptName: string;
  definition: string | null;
  domainName: string;
  kbSource: string;
  sources: string[] | null;
  relevance?: number;
  onClick?: () => void;
}

type SourceType = 'linkedin' | 'strategy' | 'book';

function detectSourceType(sources: string[] | null, kbSource: string): SourceType {
  const combined = [kbSource, ...(sources ?? [])].join(' ').toUpperCase();
  if (combined.includes('LL') || combined.includes('LINKEDIN')) return 'linkedin';
  if (
    combined.includes('STRATEGY') ||
    combined.includes('GOVERNANCE') ||
    combined.includes('EVOLUTION') ||
    combined.includes('BUILD_DEPLOY')
  )
    return 'strategy';
  return 'book';
}

const SOURCE_BADGE: Record<
  SourceType,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  linkedin: { label: 'LinkedIn Learning', color: '#0077b5', bg: '#e8f4fb', Icon: Link2 },
  strategy: { label: 'Strategy KB', color: '#15803d', bg: '#f0fdf4', Icon: TrendingUp },
  book: { label: 'Book Source', color: '#b45309', bg: '#fef3c7', Icon: BookOpen },
};

export default function ConceptCard({
  conceptName, definition, domainName, kbSource, sources, relevance, onClick,
}: ConceptCardProps) {
  const sourceType = detectSourceType(sources, kbSource);
  const srcMeta = SOURCE_BADGE[sourceType];
  const SrcIcon = srcMeta.Icon;

  return (
    <Card hover={!!onClick} onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-[14px] font-bold tracking-tight text-[var(--text)]">{conceptName}</h3>
        {relevance !== undefined && (
          <span className="text-[10px] font-bold text-[var(--text-4)]">
            {Math.round(relevance * 100)}%
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant="accent">{domainName}</Badge>
        {/* Source-type badge */}
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
          style={{ color: srcMeta.color, backgroundColor: srcMeta.bg }}
        >
          <SrcIcon size={9} />
          {srcMeta.label}
        </span>
      </div>
      <p className="text-[13px] text-[var(--text-3)] line-clamp-3">{definition}</p>
      {sources && sources.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {sources.slice(0, 3).map((s, i) => (
            <span key={i} className="text-[10px] text-[var(--text-4)] bg-[var(--surface)] px-2 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
