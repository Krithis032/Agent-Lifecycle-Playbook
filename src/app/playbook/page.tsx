import prisma from '@/lib/prisma';
import PhaseCard from '@/components/playbook/PhaseCard';

export const dynamic = 'force-dynamic';

export default async function PlaybookPage() {
  const phases = await prisma.playbookPhase.findMany({
    include: {
      steps: true,
      gateChecks: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="animate-fade-in">
      <div className="eyebrow mb-4">7-Phase Lifecycle</div>
      <h1 className="text-4xl font-bold tracking-tight mb-2 text-[var(--text)]">
        Agent Deployment <span className="text-[var(--accent)] font-light italic">Playbook</span>
      </h1>
      <p className="text-[16px] text-[var(--text-3)] max-w-[640px] mb-8">
        A structured methodology for taking AI agents from ideation to production — with gate checks, evaluation criteria, and governance at every phase.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phases.map((phase) => (
          <PhaseCard
            key={phase.slug}
            slug={phase.slug}
            phaseNum={phase.phaseNum}
            name={phase.name}
            icon={phase.icon || ''}
            duration={phase.duration || ''}
            subtitle={phase.subtitle || ''}
            stepCount={phase.steps.length}
            gateCheckCount={phase.gateChecks.length}
            color={phase.color || 'var(--accent)'}
          />
        ))}
      </div>
    </div>
  );
}
