import prisma from '@/lib/prisma';
import PhaseCard from '@/components/playbook/PhaseCard';
import PageHeader from '@/components/ui/PageHeader';

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
    <div>
      <PageHeader
        eyebrow="7-PHASE LIFECYCLE"
        title="Agent Deployment Playbook"
        subtitle="A structured methodology for taking AI agents from ideation to production — with gate checks, evaluation criteria, and governance at every phase."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid">
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
            color={phase.color || 'var(--module-playbook)'}
          />
        ))}
      </div>
    </div>
  );
}
