'use client';

import { useState, useEffect } from 'react';
import PhaseCard from '@/components/playbook/PhaseCard';
import PageHeader from '@/components/ui/PageHeader';

interface Phase {
  slug: string;
  phaseNum: number;
  name: string;
  icon: string | null;
  duration: string | null;
  subtitle: string | null;
  color: string | null;
  steps: { id: number }[];
  gateChecks: { id: number }[];
}

export default function PlaybookClient() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/playbook/phases')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setPhases(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch phases:', err);
        setPhases([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-48 bg-[var(--surface-1)] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
