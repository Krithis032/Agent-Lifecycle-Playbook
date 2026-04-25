'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
}

export default function Tooltip({ content, children, position = 'top', maxWidth = 280 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;
    const tRect = triggerRef.current.getBoundingClientRect();
    const ttRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = tRect.top - ttRect.height - 8;
        left = tRect.left + tRect.width / 2 - ttRect.width / 2;
        break;
      case 'bottom':
        top = tRect.bottom + 8;
        left = tRect.left + tRect.width / 2 - ttRect.width / 2;
        break;
      case 'left':
        top = tRect.top + tRect.height / 2 - ttRect.height / 2;
        left = tRect.left - ttRect.width - 8;
        break;
      case 'right':
        top = tRect.top + tRect.height / 2 - ttRect.height / 2;
        left = tRect.right + 8;
        break;
    }

    // Keep within viewport
    if (left < 8) left = 8;
    if (left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
    if (top < 8) {
      top = tRect.bottom + 8; // flip to bottom
    }

    setCoords({ top, left });
  }, [visible, position]);

  if (!content) return <>{children}</>;

  return (
    <div
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2 text-[11px] leading-relaxed font-medium rounded-lg pointer-events-none animate-fade-in"
          style={{
            top: coords.top,
            left: coords.left,
            maxWidth,
            color: 'var(--text-primary)',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
