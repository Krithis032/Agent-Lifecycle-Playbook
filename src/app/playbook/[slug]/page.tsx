import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StepAccordion from '@/components/playbook/StepAccordion';
import GateChecklist from '@/components/playbook/GateChecklist';
import InterviewAngle from '@/components/playbook/InterviewAngle';
import PhaseTimeline from '@/components/playbook/PhaseTimeline';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PhaseDetailPage({ params }: Props) {
  const { slug } = await params;

  const allPhases = await prisma.playbookPhase.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { phaseNum: true, name: true, icon: true, color: true, slug: true },
  });

  const phase = await prisma.playbookPhase.findUnique({
    where: { slug },
    include: {
      steps: { orderBy: { sortOrder: 'asc' } },
      gateChecks: true,
    },
  });

  if (!phase) notFound();

  return (
    <div>
      <PhaseTimeline phases={allPhases} currentSlug={slug} />

      <div className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{phase.icon}</span>
          <div>
            <div className="eyebrow">Phase {phase.phaseNum}</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
              {phase.name}
            </h1>
          </div>
        </div>
        <p className="text-[15px] text-[var(--text-3)] max-w-[640px] mt-2">{phase.subtitle}</p>
        <div className="mt-3">
          <Badge variant="accent">{phase.duration}</Badge>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold tracking-tight mb-4 text-[var(--text)]">Steps</h2>
        {phase.steps.map((step) => (
          <StepAccordion
            key={step.id}
            stepNum={step.stepNum}
            title={step.title}
            body={step.body}
            deliverables={(step.deliverables as string[]) || []}
            tools={(step.tools as string[]) || []}
            codeExample={step.codeExample}
            proTip={step.proTip}
            color={phase.color || 'var(--accent)'}
          />
        ))}
      </div>

      {phase.gateChecks.map((gate) => (
        <div key={gate.id} className="mb-8">
          <GateChecklist
            gateTitle={gate.gateTitle}
            checkItems={(gate.checkItems as string[]) || []}
          />
        </div>
      ))}

      {phase.interviewAngle && (
        <InterviewAngle angle={phase.interviewAngle} />
      )}
    </div>
  );
}
