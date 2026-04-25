'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import type { CaioActionItem } from '@/types/caio';

interface ActionPlanTrackerProps {
  actions: CaioActionItem[];
  onStatusChange?: (actionId: number, status: string) => Promise<void>;
  onOwnerChange?: (actionId: number, owner: string) => Promise<void>;
}

const phaseLabels: Record<string, { label: string; dotColor: string }> = {
  immediate: { label: 'Immediate (0-30 days)', dotColor: 'var(--status-error)' },
  short_term: { label: 'Short Term (1-3 months)', dotColor: 'var(--status-warning)' },
  long_term: { label: 'Long Term (3-12 months)', dotColor: 'var(--brand-primary)' },
};

const ownerStyles: Record<string, { bg: string; color: string }> = {
  CAIO: { bg: 'var(--status-info-soft)', color: 'var(--status-info)' },
  CTO: { bg: 'rgba(139,92,246,0.1)', color: '#7c3aed' },
  CDO: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8' },
  Legal: { bg: 'var(--status-warning-soft)', color: 'var(--status-warning)' },
  HR: { bg: 'rgba(236,72,153,0.1)', color: '#f472b6' },
  PM: { bg: 'rgba(20,184,166,0.1)', color: '#5eead4' },
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
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'var(--brand-primary)' }} />
        </div>
        <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{progressPct}%</span>
        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{completed}/{total} complete</span>
      </div>

      {(['immediate', 'short_term', 'long_term'] as const).map(phase => {
        const items = grouped[phase];
        if (items.length === 0) return null;
        const p = phaseLabels[phase];

        return (
          <div key={phase}>
            <h3 className="text-[13px] font-bold flex items-center gap-2 mb-3 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.dotColor }} />
              {p.label} ({items.length})
            </h3>
            <div className="space-y-2">
              {items.map((action) => (
                <div
                  key={action.id}
                  className={`rounded-lg p-4 ${updating === action.id ? 'opacity-50' : ''}`}
                  style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[13px] flex-1" style={{ color: 'var(--text-primary)' }}>{action.action}</p>
                    <div className="flex gap-1.5 shrink-0 ml-2">
                      {action.owner && (
                        <span
                          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            background: ownerStyles[action.owner]?.bg || 'var(--surface-1)',
                            color: ownerStyles[action.owner]?.color || 'var(--text-secondary)',
                          }}
                        >
                          {action.owner}
                        </span>
                      )}
                    </div>
                  </div>
                  {action.frameworkRef && (
                    <Badge variant="brand" className="mb-2">{action.frameworkRef}</Badge>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {onStatusChange ? (
                      <select
                        value={action.status}
                        onChange={(e) => handleStatus(action.id, e.target.value)}
                        className="text-[12px] px-2 py-1 rounded focus:outline-none"
                        style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                        className="text-[12px] px-2 py-1 rounded focus:outline-none"
                        style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
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
        <p className="text-center py-6" style={{ color: 'var(--text-tertiary)' }}>No action items generated</p>
      )}
    </div>
  );
}
