'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import type { CaioActionItem } from '@/types/caio';

interface ActionPlanTrackerProps {
  actions: CaioActionItem[];
  onStatusChange?: (actionId: number, status: string) => Promise<void>;
  onOwnerChange?: (actionId: number, owner: string) => Promise<void>;
}

const phaseLabels: Record<string, { label: string; icon: string }> = {
  immediate: { label: 'Immediate (0-30 days)', icon: '⚡' },
  short_term: { label: 'Short Term (1-3 months)', icon: '📅' },
  long_term: { label: 'Long Term (3-12 months)', icon: '🎯' },
};

const ownerColors: Record<string, string> = {
  CAIO: 'bg-blue-50 text-blue-700',
  CTO: 'bg-purple-50 text-purple-700',
  CDO: 'bg-indigo-50 text-indigo-700',
  Legal: 'bg-amber-50 text-amber-700',
  HR: 'bg-pink-50 text-pink-700',
  PM: 'bg-teal-50 text-teal-700',
};

export default function ActionPlanTracker({ actions, onStatusChange, onOwnerChange }: ActionPlanTrackerProps) {
  const [updating, setUpdating] = useState<number | null>(null);

  const grouped = {
    immediate: actions.filter(a => a.phase === 'immediate'),
    short_term: actions.filter(a => a.phase === 'short_term'),
    long_term: actions.filter(a => a.phase === 'long_term'),
  };

  const total = actions.length;
  const completed = actions.filter(a => a.status === 'completed').length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleStatus = async (actionId: number, status: string) => {
    if (!onStatusChange) return;
    setUpdating(actionId);
    await onStatusChange(actionId, status);
    setUpdating(null);
  };

  const handleOwner = async (actionId: number, owner: string) => {
    if (!onOwnerChange) return;
    setUpdating(actionId);
    await onOwnerChange(actionId, owner);
    setUpdating(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[13px] font-bold text-[var(--text)]">{progressPct}%</span>
        <span className="text-[12px] text-[var(--text-3)]">{completed}/{total} complete</span>
      </div>

      {(['immediate', 'short_term', 'long_term'] as const).map(phase => {
        const items = grouped[phase];
        if (items.length === 0) return null;
        const p = phaseLabels[phase];

        return (
          <div key={phase}>
            <h3 className="text-[13px] font-bold text-[var(--text)] flex items-center gap-2 mb-3">
              {p.icon} {p.label} ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((action) => (
                <div key={action.id} className={`border border-[var(--border)] rounded-lg p-4 bg-white ${updating === action.id ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[13px] text-[var(--text)] flex-1">{action.action}</p>
                    <div className="flex gap-1.5 shrink-0 ml-2">
                      {action.owner && (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${ownerColors[action.owner] || 'bg-gray-50 text-gray-700'}`}>
                          {action.owner}
                        </span>
                      )}
                    </div>
                  </div>
                  {action.frameworkRef && (
                    <Badge variant="accent" className="mb-2">{action.frameworkRef}</Badge>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {onStatusChange ? (
                      <select
                        value={action.status}
                        onChange={(e) => handleStatus(action.id, e.target.value)}
                        className="text-[12px] px-2 py-1 border border-[var(--border)] rounded bg-white focus:outline-none focus:border-[var(--accent)]"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <Badge variant={action.status === 'completed' ? 'success' : action.status === 'in_progress' ? 'info' : 'default'}>
                        {action.status}
                      </Badge>
                    )}
                    {onOwnerChange && (
                      <select
                        value={action.owner || ''}
                        onChange={(e) => handleOwner(action.id, e.target.value)}
                        className="text-[12px] px-2 py-1 border border-[var(--border)] rounded bg-white focus:outline-none focus:border-[var(--accent)]"
                      >
                        <option value="">Assign Owner</option>
                        {['CAIO', 'CTO', 'CDO', 'Legal', 'HR', 'PM'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {actions.length === 0 && (
        <p className="text-center text-[var(--text-3)] py-6">No action items generated</p>
      )}
    </div>
  );
}
