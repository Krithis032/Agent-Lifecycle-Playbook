import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color: string;
  href?: string;
}

export default function StatCard({ icon: Icon, value, label, color, href }: StatCardProps) {
  const content = (
    <div
      className="stat-card"
      style={{ '--stat-accent-color': color } as React.CSSProperties}
    >
      <div className="stat-card-inner">
        <div
          className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-3"
          style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div
          className="stat-value text-[30px] font-extrabold leading-none tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </div>
        <div
          className="text-[12px] font-semibold mt-1.5 uppercase tracking-[0.5px]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {label}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
