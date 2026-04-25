'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import ActionPlanTracker from '@/components/caio/ActionPlanTracker';
import type { CaioActionItem } from '@/types/caio';
import { ChevronLeft, Filter } from 'lucide-react';

export default function CaioActionsPage({ params }: { params: { id: string } }) {
  const [actions, setActions] = useState<CaioActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPhase, setFilterPhase] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchWithAuth(`/api/caio/${params.id}`)
      .then(r => r.json())
      .then(data => { setActions(data.actionItems || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleStatusChange = async (actionId: number, status: string) => {
    const res = await fetchWithAuth(`/api/caio/actions/${actionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setActions(prev => prev.map(a => a.id === actionId ? { ...a, status } : a));
    }
  };

  const handleOwnerChange = async (actionId: number, owner: string) => {
    const res = await fetchWithAuth(`/api/caio/actions/${actionId}`, {
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

  if (loading) return <p className="py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>Loading actions...</p>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <Link
          href={`/caio/${params.id}`}
          className="text-[12px] font-semibold transition-colors mb-2 block"
          style={{ color: 'var(--text-quaternary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-quaternary)'}
        >
          <ChevronLeft size={14} className="inline" /> Back to Assessment
        </Link>
        <PageHeader
          eyebrow="CAIO"
          title="Action Plan Tracker"
          subtitle="Track and manage action items from the CAIO assessment."
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter size={14} style={{ color: 'var(--text-quaternary)' }} />
        <select
          value={filterPhase}
          onChange={e => setFilterPhase(e.target.value)}
          className="px-2 py-1 rounded text-[12px] transition-all"
          style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
        >
          <option value="">All Phases</option>
          <option value="immediate">Immediate</option>
          <option value="short_term">Short Term</option>
          <option value="long_term">Long Term</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-2 py-1 rounded text-[12px] transition-all"
          style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
        >
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
          <p style={{ color: 'var(--text-tertiary)' }}>No action items found</p>
        </Card>
      )}
    </div>
  );
}
