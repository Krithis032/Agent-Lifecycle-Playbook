'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import StepAccordion from '@/components/playbook/StepAccordion';
import GateChecklist from '@/components/playbook/GateChecklist';
import InterviewAngle from '@/components/playbook/InterviewAngle';
import PhaseTimeline from '@/components/playbook/PhaseTimeline';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import SectionPanel from '@/components/ui/SectionPanel';
import { ListChecks, ClipboardCheck } from 'lucide-react';

interface Step {
  id: number;
  stepNum: number;
  title: string;
  body: string | null;
  deliverables: unknown;
  tools: unknown;
  codeExample: string | null;
  proTip: string | null;
}

interface GateCheck {
  id: number;
  gateTitle: string;
  checkItems: unknown;
}

interface Phase {
  phaseNum: number;
  name: string;
  icon: string | null;
  color: string | null;
  slug: string;
  subtitle: string | null;
  duration: string | null;
  interviewAngle: string | null;
  steps: Step[];
  gateChecks: GateCheck[];
}

interface PhaseTimelineItem {
  phaseNum: number;
  name: string;
  icon: string | null;
  color: string | null;
  slug: string;
}

export default function PhaseDetailClient({ slug }: { slug: string }) {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [allPhases, setAllPhases] = useState<PhaseTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/playbook/phases').then(res => res.json()),
      fetch(`/api/playbook/phases/${slug}`).then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
    ])
      .then(([phases, phaseData]) => {
        setAllPhases(phases.map((p: Phase) => ({
          phaseNum: p.phaseNum,
          name: p.name,
          icon: p.icon,
          color: p.color,
          slug: p.slug,
        })));
        setPhase(phaseData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch phase:', err);
        setNotFoundError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[var(--surface-1)] rounded w-full"></div>
          <div className="h-12 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="h-6 bg-[var(--surface-1)] rounded w-1/4"></div>
          <div className="h-64 bg-[var(--surface-1)] rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  if (notFoundError || !phase) {
    notFound();
  }

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
              body={step.body || ''}
              deliverables={(step.deliverables as string[]) || []}
              tools={(step.tools as string[]) || []}
              codeExample={step.codeExample ?? null}
              proTip={step.proTip ?? null}
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
