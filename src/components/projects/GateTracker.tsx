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
          <div key={title} className="bg-[var(--canvas)] border border-[var(--border)] rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold tracking-tight">{title}</h3>
              <span className="text-[12px] font-bold text-[var(--text-3)]">{pct}%</span>
            </div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <button
                  key={`${item.gateCheckId}-${item.itemIndex}`}
                  onClick={() => onToggle(item.gateCheckId, item.itemIndex, !item.checked)}
                  className={`flex items-start gap-2.5 w-full text-left px-3 py-1.5 rounded-lg transition-all ${
                    item.checked ? 'bg-[var(--green-soft)]' : 'hover:bg-[var(--surface)]'
                  }`}
                >
                  {item.checked ? (
                    <CheckCircle2 size={16} className="text-[var(--green)] mt-0.5 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-[var(--text-4)] mt-0.5 shrink-0" />
                  )}
                  <span className={`text-[13px] ${item.checked ? 'text-[var(--green)] line-through' : 'text-[var(--text-2)]'}`}>
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
