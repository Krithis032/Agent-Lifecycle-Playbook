'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  number?: number;
  numberColor?: string;
}

export default function Accordion({ title, children, defaultOpen = false, number, numberColor = 'var(--brand-primary)' }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`border rounded-[var(--radius-lg)] mb-3 overflow-hidden transition-all duration-300 ${
        open
          ? 'border-[var(--border-strong)] shadow-[var(--shadow-card)] bg-[var(--surface-elevated)]'
          : 'border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--surface-elevated)]'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3.5 px-5 py-4 w-full text-left cursor-pointer select-none"
      >
        {number !== undefined && (
          <span
            className="text-[11px] font-bold w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${numberColor} 10%, transparent)`, color: numberColor }}
          >
            {number}
          </span>
        )}
        <span className="text-[13px] font-semibold flex-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</span>
        <span
          className={`w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center transition-all duration-300 ${
            open
              ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)] rotate-180'
              : 'bg-[var(--surface-1)] text-[var(--text-tertiary)]'
          }`}
        >
          <ChevronDown size={13} />
        </span>
      </button>
      <div className={`transition-all duration-500 overflow-hidden ${open ? 'max-h-[20000px]' : 'max-h-0'}`}>
        <div className="px-5 pb-5 pt-4 border-t border-[var(--border-default)]" style={{ background: 'var(--surface-0)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
