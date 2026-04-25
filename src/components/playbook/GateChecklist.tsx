'use client';

import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface GateChecklistProps {
  gateTitle: string;
  checkItems: string[];
  onToggle?: (index: number, checked: boolean) => void;
  initialChecked?: boolean[];
}

export default function GateChecklist({ gateTitle, checkItems, onToggle, initialChecked }: GateChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(
    initialChecked || new Array(checkItems.length).fill(false)
  );

  const toggle = (index: number) => {
    const next = [...checked];
    next[index] = !next[index];
    setChecked(next);
    onToggle?.(index, next[index]);
  };

  const completedCount = checked.filter(Boolean).length;
  const pct = checkItems.length > 0 ? Math.round((completedCount / checkItems.length) * 100) : 0;

  return (
    <div
      className="rounded-[var(--radius-lg)] p-6"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{gateTitle}</h3>
        <span
          className="text-[13px] font-bold"
          style={{ color: pct === 100 ? 'var(--status-success)' : 'var(--text-tertiary)' }}
        >
          {completedCount}/{checkItems.length} ({pct}%)
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full mb-4 overflow-hidden"
        style={{ background: 'var(--surface-1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? 'var(--status-success)' : 'var(--brand-primary)',
          }}
        />
      </div>
      <div className="space-y-2">
        {checkItems.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-start gap-3 w-full text-left px-3 py-2 rounded-[var(--radius-md)] transition-all duration-200"
            style={{
              background: checked[i] ? 'var(--status-success-soft)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!checked[i]) e.currentTarget.style.background = 'var(--surface-0)';
            }}
            onMouseLeave={(e) => {
              if (!checked[i]) e.currentTarget.style.background = 'transparent';
            }}
          >
            {checked[i] ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--status-success)' }} />
            ) : (
              <Circle size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            )}
            <span
              className={`text-[13px] ${checked[i] ? 'line-through' : ''}`}
              style={{ color: checked[i] ? 'var(--status-success)' : 'var(--text-secondary)' }}
            >
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
