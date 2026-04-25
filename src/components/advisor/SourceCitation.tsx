'use client';

import { BookOpen, Link2, TrendingUp } from 'lucide-react';

interface SourceCitationProps {
  concepts: { id: number; name: string; domain: string; source: string }[];
}

type SourceType = 'linkedin' | 'strategy' | 'book';

function detectSourceType(source: string): SourceType {
  if (!source) return 'book';
  const s = source.toUpperCase();
  if (s.startsWith('LL') || s.includes('LINKEDIN')) return 'linkedin';
  if (
    s.includes('STRATEGY') ||
    s.includes('GOVERNANCE') ||
    s.includes('EVOLUTION') ||
    s.includes('BUILD_DEPLOY') ||
    s.includes('KB_STRATEGY')
  )
    return 'strategy';
  return 'book';
}

const SOURCE_META: Record<
  SourceType,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  linkedin: {
    label: 'Agents & Tools',
    color: '#0077b5',
    bg: '#e8f4fb',
    Icon: Link2,
  },
  strategy: {
    label: 'Strategy Synthesis',
    color: '#15803d',
    bg: '#f0fdf4',
    Icon: TrendingUp,
  },
  book: {
    label: 'Book Source',
    color: '#b45309',
    bg: '#fef3c7',
    Icon: BookOpen,
  },
};

export default function SourceCitation({ concepts }: SourceCitationProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <BookOpen size={12} style={{ color: 'var(--text-quaternary)' }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)' }}>
          Sources
        </span>
      </div>
      <div className="space-y-1.5">
        {concepts.map((c) => {
          const type = detectSourceType(c.source);
          const meta = SOURCE_META[type];
          const Icon = meta.Icon;
          return (
            <div key={c.id} className="flex items-start gap-1.5">
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 mt-0.5"
                style={{ color: meta.color, backgroundColor: meta.bg }}
              >
                <Icon size={8} />
                {meta.label}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                <strong>{c.name}</strong> ({c.domain}){c.source ? ` — ${c.source}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
