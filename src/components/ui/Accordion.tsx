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

export default function Accordion({ title, children, defaultOpen = false, number, numberColor = 'var(--accent)' }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`bg-[var(--surface)] border rounded-[var(--radius)] mb-3 overflow-hidden transition-all duration-300 ${open ? 'border-[var(--border-hover)] shadow-[var(--shadow-card)]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3.5 px-5 py-4 w-full text-left cursor-pointer select-none"
      >
        {number !== undefined && (
          <span
            className="text-[11px] font-bold w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
            style={{ background: `${numberColor}15`, color: numberColor }}
          >
            {number}
          </span>
        )}
        <span className="text-[13px] font-semibold flex-1 tracking-tight text-[var(--text)]">{title}</span>
        <span className={`w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center transition-all duration-300 ${open ? 'bg-[var(--accent-soft)] text-[var(--accent)] rotate-180' : 'bg-[var(--surface-hover)] text-[var(--text-4)]'}`}>
          <ChevronDown size={13} />
        </span>
      </button>
      <div className={`transition-all duration-500 overflow-hidden ${open ? 'max-h-[20000px]' : 'max-h-0'}`}>
        <div className="px-5 pb-5 pt-4 border-t border-[var(--border)]">
          {children}
        </div>
      </div>
    </div>
  );
}
