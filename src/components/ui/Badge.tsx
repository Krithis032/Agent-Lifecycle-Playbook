type BadgeVariant = 'default' | 'accent' | 'green' | 'amber' | 'purple' | 'cyan' | 'coral' | 'success' | 'warning' | 'error' | 'info';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--surface)] text-[var(--text-3)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  green: 'bg-[var(--success-soft)] text-[var(--success)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  coral: 'bg-[var(--error-soft)] text-[var(--error)]',
  error: 'bg-[var(--error-soft)] text-[var(--error)]',
  amber: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  purple: 'bg-purple-50 text-purple-700',
  cyan: 'bg-cyan-50 text-cyan-700',
  info: 'bg-[var(--info-soft)] text-[var(--info)]',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-block text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded-[4px] uppercase ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
