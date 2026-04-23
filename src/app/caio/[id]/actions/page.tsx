'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ActionPlanTracker from '@/components/caio/ActionPlanTracker';
import type { CaioActionItem } from '@/types/caio';
import { ChevronLeft, Filter } from 'lucide-react';

export default function CaioActionsPage({ params }: { params: { id: string } }) {
  const [actions, setActions] = useState<CaioActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPhase, setFilterPhase] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetch(`/api/caio/${params.id}`)
      .then(r => r.json())
      .then(data => { setActions(data.actionItems || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleStatusChange = async (actionId: number, status: string) => {
    const res = await fetch(`/api/caio/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, status } : a));
    }
  };

  const handleOwnerChange = async (actionId: number, owner: string) => {
    const res = await fetch(`/api/caio/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner }),
    });
    if (res.ok) {
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, owner } : a));
    }
  };

  const filtered = actions.filter(a =>
    (!filterPhase || a.phase === filterPhase) &&
    (!filterStatus || a.status === filterStatus)
  );

  if (loading) return <p className="text-[var(--text-3)] py-12 text-center">Loading actions...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/caio/${params.id}`} className="text-[12px] font-semibold text-[var(--text-4)] hover:text-[var(--accent)] transition-colors mb-2 block">
          <ChevronLeft size={14} className="inline" /> Back to Assessment
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Action Plan Tracker</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">Track and manage action items from the CAIO assessment.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter size={14} className="text-[var(--text-4)]" />
        <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} className="px-2 py-1 border border-[var(--border)] rounded text-[12px] bg-white">
          <option value="">All Phases</option>
          <option value="immediate">Immediate</option>
          <option value="short_term">Short Term</option>
          <option value="long_term">Long Term</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-2 py-1 border border-[var(--border)] rounded text-[12px] bg-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <Badge variant="default">{filtered.length} actions</Badge>
      </div>

      {/* Action Tracker */}
      {filtered.length > 0 ? (
        <ActionPlanTracker
          actions={filtered}
          onStatusChange={handleStatusChange}
          onOwnerChange={handleOwnerChange}
        />
      ) : (
        <Card className="text-center py-12">
          <p className="text-[var(--text-3)]">No action items found</p>
        </Card>
      )}
    </div>
  );
}
