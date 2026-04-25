import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionPanelProps {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionPanel({ title, icon: Icon, action, children, className = '' }: SectionPanelProps) {
  return (
    <div className={`bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-[12px] shadow-[var(--shadow-card)] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]" style={{ background: 'var(--surface-0)' }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} style={{ color: 'var(--text-tertiary)' }} />}
          <h3 className="text-[16px] font-semibold leading-[1.4]" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
