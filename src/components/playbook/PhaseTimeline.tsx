import Link from 'next/link';

interface PhaseTimelineProps {
  phases: { phaseNum: number; name: string; icon: string | null; color: string | null; slug: string }[];
  currentSlug?: string;
}

export default function PhaseTimeline({ phases, currentSlug }: PhaseTimelineProps) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto pb-2 scrollbar-hide">
      {phases.map((phase, i) => {
        const active = phase.slug === currentSlug;
        return (
          <div key={phase.slug} className="flex items-center shrink-0">
            <Link
              href={`/playbook/${phase.slug}`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--text-4)] hover:text-[var(--text-2)] hover:bg-[var(--accent-glow)]'
              }`}
            >
              <span className="text-sm">{phase.icon}</span>
              <span>{phase.name}</span>
            </Link>
            {i < phases.length - 1 && (
              <div className="w-3 h-px bg-[var(--border)] mx-0.5" />
            )}
          </div>
        );
      })}
    </div>
  );
}
