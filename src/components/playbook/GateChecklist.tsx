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
    <div className="bg-[var(--canvas)] border border-[var(--border)] rounded-[14px] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold tracking-tight text-[var(--text)]">{gateTitle}</h3>
        <span className={`text-[13px] font-bold ${pct === 100 ? 'text-[var(--green)]' : 'text-[var(--text-3)]'}`}>
          {completedCount}/{checkItems.length} ({pct}%)
        </span>
      </div>
      <div className="w-full h-1.5 bg-[var(--surface)] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)' }}
        />
      </div>
      <div className="space-y-2">
        {checkItems.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`flex items-start gap-3 w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
              checked[i] ? 'bg-[var(--green-soft)]' : 'hover:bg-[var(--surface)]'
            }`}
          >
            {checked[i] ? (
              <CheckCircle2 size={18} className="text-[var(--green)] mt-0.5 shrink-0" />
            ) : (
              <Circle size={18} className="text-[var(--text-4)] mt-0.5 shrink-0" />
            )}
            <span className={`text-[13px] ${checked[i] ? 'text-[var(--green)] line-through' : 'text-[var(--text-2)]'}`}>
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
