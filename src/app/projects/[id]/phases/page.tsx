'use client';

import { useProject } from '@/hooks/useProject';
import PhaseProgress from '@/components/projects/PhaseProgress';
import PageHeader from '@/components/ui/PageHeader';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function ProjectPhasesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { project, loading } = useProject(parseInt(id));

  if (loading) return <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>;
  if (!project) return <p style={{ color: 'var(--text-tertiary)' }}>Project not found</p>;

  const phases = (project.phaseProgress || []).map((pp) => ({
    phaseNum: pp.phase?.phaseNum || 0,
    name: pp.phase?.name || '',
    icon: pp.phase?.icon || '',
    status: pp.status,
  }));

  return (
    <div>
      <Link href={`/projects/${id}`}>
        <Button variant="ghost" size="sm" className="mb-6">Back to Project</Button>
      </Link>
      <PageHeader
        eyebrow="PHASE PROGRESS"
        title={project.name}
        subtitle="Track lifecycle phase completion across the deployment."
      />
      <div className="mt-6">
        <PhaseProgress phases={phases} />
      </div>
    </div>
  );
}
