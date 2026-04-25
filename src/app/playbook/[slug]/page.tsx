import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StepAccordion from '@/components/playbook/StepAccordion';
import GateChecklist from '@/components/playbook/GateChecklist';
import InterviewAngle from '@/components/playbook/InterviewAngle';
import PhaseTimeline from '@/components/playbook/PhaseTimeline';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import SectionPanel from '@/components/ui/SectionPanel';
import { ListChecks, ClipboardCheck } from 'lucide-react';

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
            <PageHeader
              eyebrow={`PHASE ${phase.phaseNum}`}
              title={phase.name}
              subtitle={phase.subtitle || undefined}
            />
          </div>
        </div>
        <div className="mt-3">
          <Badge variant="brand">{phase.duration}</Badge>
        </div>
      </div>

      <SectionPanel title="Steps" icon={ListChecks} className="mb-6">
        <div className="p-4">
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
              color={phase.color || 'var(--module-playbook)'}
            />
          ))}
        </div>
      </SectionPanel>

      {phase.gateChecks.length > 0 && (
        <SectionPanel title="Gate Checks" icon={ClipboardCheck} className="mb-6">
          <div className="p-4 space-y-4">
            {phase.gateChecks.map((gate) => (
              <GateChecklist
                key={gate.id}
                gateTitle={gate.gateTitle}
                checkItems={(gate.checkItems as string[]) || []}
              />
            ))}
          </div>
        </SectionPanel>
      )}

      {phase.interviewAngle && (
        <div className="mb-6">
          <InterviewAngle angle={phase.interviewAngle} />
        </div>
      )}
    </div>
  );
}
