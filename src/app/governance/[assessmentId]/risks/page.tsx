'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RiskItemCard from '@/components/governance/RiskItemCard';
import type { RiskItem } from '@/types/governance';
import { ChevronLeft, Plus, Filter } from 'lucide-react';

export default function RiskRegisterPage({ params }: { params: { assessmentId: string } }) {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', severity: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newRisk, setNewRisk] = useState({ category: 'data', severity: 'medium', title: '', description: '', mitigation: '' });

  useEffect(() => {
    fetch(`/api/governance/detail/${params.assessmentId}`)
      .then(r => r.json())
      .then(data => { setRisks(data.riskItems || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.assessmentId]);

  const handleStatusChange = async (riskId: number, status: string) => {
    await fetch(`/api/governance/risks/${riskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setRisks(prev => prev.map(r => r.id === riskId ? { ...r, status } : r));
  };

  const handleMitigationChange = async (riskId: number, mitigation: string) => {
    await fetch(`/api/governance/risks/${riskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mitigation }),
    });
    setRisks(prev => prev.map(r => r.id === riskId ? { ...r, mitigation } : r));
  };

  const handleAddRisk = async () => {
    if (!newRisk.title.trim()) return;
    const res = await fetch('/api/governance/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRisk, assessmentId: parseInt(params.assessmentId) }),
    });
    if (res.ok) {
      const risk = await res.json();
      setRisks(prev => [...prev, risk]);
      setNewRisk({ category: 'data', severity: 'medium', title: '', description: '', mitigation: '' });
      setShowAdd(false);
    }
  };

  const filtered = risks.filter(r =>
    (!filter.category || r.category === filter.category) &&
    (!filter.severity || r.severity === filter.severity)
  );

  if (loading) return <p className="text-[var(--text-3)] py-12 text-center">Loading risks...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/governance/${params.assessmentId}`} className="text-[12px] font-semibold text-[var(--text-4)] hover:text-[var(--accent)] transition-colors mb-2 block">
          <ChevronLeft size={14} className="inline" /> Back to Assessment
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Risk Register</h1>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} /> Add Risk
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter size={14} className="text-[var(--text-4)]" />
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} className="px-2 py-1 border border-[var(--border)] rounded text-[12px] bg-white">
          <option value="">All Categories</option>
          {['data', 'model', 'security', 'compliance', 'operational', 'ethical'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filter.severity} onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))} className="px-2 py-1 border border-[var(--border)] rounded text-[12px] bg-white">
          <option value="">All Severities</option>
          {['low', 'medium', 'high', 'critical'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Badge variant="default">{filtered.length} items</Badge>
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card>
          <h3 className="text-[14px] font-semibold mb-3">New Risk Item</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select value={newRisk.category} onChange={e => setNewRisk(p => ({ ...p, category: e.target.value }))} className="px-3 py-2 border border-[var(--border)] rounded-md text-[13px] bg-white">
              {['data', 'model', 'security', 'compliance', 'operational', 'ethical'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={newRisk.severity} onChange={e => setNewRisk(p => ({ ...p, severity: e.target.value }))} className="px-3 py-2 border border-[var(--border)] rounded-md text-[13px] bg-white">
              {['low', 'medium', 'high', 'critical'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <input type="text" placeholder="Risk title..." value={newRisk.title} onChange={e => setNewRisk(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-[13px] bg-white mb-2" />
          <textarea rows={2} placeholder="Description..." value={newRisk.description} onChange={e => setNewRisk(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-[13px] bg-white resize-none mb-2" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddRisk}>Save Risk</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Risk List */}
      <div className="space-y-3">
        {filtered.map(r => (
          <RiskItemCard
            key={r.id}
            risk={r}
            onStatusChange={(status) => handleStatusChange(r.id, status)}
            onMitigationChange={(mitigation) => handleMitigationChange(r.id, mitigation)}
          />
        ))}
        {filtered.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-[var(--text-3)]">No risk items found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
