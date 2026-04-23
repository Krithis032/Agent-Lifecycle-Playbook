'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/hooks/useProject';
import GateTracker from '@/components/projects/GateTracker';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface GateCheckData {
  gateCheckId: number;
  gateTitle: string;
  itemIndex: number;
  label: string;
  checked: boolean;
}

export default function ProjectGatesPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const projectId = parseInt(id);
  const { project, loading, toggleGate } = useProject(projectId);
  const [gates, setGates] = useState<GateCheckData[]>([]);

  useEffect(() => {
    if (!project) return;
    // Fetch all gate checks for this project and build the list
    fetch(`/api/playbook/phases`)
      .then((r) => r.json())
      .then((phases) => {
        const items: GateCheckData[] = [];
        for (const phase of phases) {
          for (const gc of phase.gateChecks || []) {
            const checkItems = (gc.checkItems as string[]) || [];
            checkItems.forEach((label: string, idx: number) => {
              const existing = project.gateChecks?.find(
                (pg) => pg.gateCheckId === gc.id && pg.itemIndex === idx
              );
              items.push({
                gateCheckId: gc.id,
                gateTitle: gc.gateTitle,
                itemIndex: idx,
                label,
                checked: existing?.checked || false,
              });
            });
          }
        }
        setGates(items);
      });
  }, [project]);

  if (loading) return <p className="text-[var(--text-3)]">Loading...</p>;
  if (!project) return <p className="text-[var(--text-3)]">Project not found</p>;

  const handleToggle = async (gateCheckId: number, itemIndex: number, checked: boolean) => {
    await toggleGate(gateCheckId, itemIndex, checked);
    setGates((prev) =>
      prev.map((g) =>
        g.gateCheckId === gateCheckId && g.itemIndex === itemIndex ? { ...g, checked } : g
      )
    );
  };

  return (
    <div>
      <Link href={`/projects/${id}`}>
        <Button variant="ghost" size="sm" className="mb-6">Back to Project</Button>
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight mb-6">Gate Tracker: {project.name}</h1>
      <GateTracker gates={gates} onToggle={handleToggle} />
    </div>
  );
}
