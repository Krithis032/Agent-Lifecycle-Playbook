'use client';

import { useProject } from '@/hooks/useProject';
import PhaseProgress from '@/components/projects/PhaseProgress';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function ProjectPhasesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { project, loading } = useProject(parseInt(id));

  if (loading) return <p className="text-[var(--text-3)]">Loading...</p>;
  if (!project) return <p className="text-[var(--text-3)]">Project not found</p>;

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
      <h1 className="text-2xl font-bold tracking-tight mb-6">Phase Progress: {project.name}</h1>
      <PhaseProgress phases={phases} />
    </div>
  );
}
