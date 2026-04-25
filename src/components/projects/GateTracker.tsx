'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface GateItem {
  gateCheckId: number;
  gateTitle: string;
  itemIndex: number;
  label: string;
  checked: boolean;
}

interface GateTrackerProps {
  gates: GateItem[];
  onToggle: (gateCheckId: number, itemIndex: number, checked: boolean) => void;
}

export default function GateTracker({ gates, onToggle }: GateTrackerProps) {
  const grouped = gates.reduce<Record<string, GateItem[]>>((acc, g) => {
    if (!acc[g.gateTitle]) acc[g.gateTitle] = [];
    acc[g.gateTitle].push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([title, items]) => {
        const completed = items.filter((i) => i.checked).length;
        const pct = Math.round((completed / items.length) * 100);
        return (
          <div
            key={title}
            className="rounded-[var(--radius-lg)] p-5"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <span
                className="text-[12px] font-bold"
                style={{ color: pct === 100 ? 'var(--status-success)' : 'var(--text-tertiary)' }}
              >
                {completed}/{items.length} ({pct}%)
              </span>
            </div>
            {/* Progress bar */}
            <div
              className="w-full h-1.5 rounded-full mb-3 overflow-hidden"
              style={{ background: 'var(--surface-1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? 'var(--status-success)' : 'var(--module-projects)',
                }}
              />
            </div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <button
                  key={`${item.gateCheckId}-${item.itemIndex}`}
                  onClick={() => onToggle(item.gateCheckId, item.itemIndex, !item.checked)}
                  className="flex items-start gap-2.5 w-full text-left px-3 py-1.5 rounded-[var(--radius-md)] transition-all"
                  style={{
                    background: item.checked ? 'var(--status-success-soft)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!item.checked) e.currentTarget.style.background = 'var(--surface-0)';
                  }}
                  onMouseLeave={(e) => {
                    if (!item.checked) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {item.checked ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--status-success)' }} />
                  ) : (
                    <Circle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--text-quaternary)' }} />
                  )}
                  <span
                    className={`text-[13px] ${item.checked ? 'line-through' : ''}`}
                    style={{ color: item.checked ? 'var(--status-success)' : 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
