type BadgeVariant = 'default' | 'accent' | 'green' | 'amber' | 'purple' | 'cyan' | 'coral' | 'success' | 'warning' | 'error' | 'info';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--surface-hover)] text-[var(--text-3)] border-[var(--border)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[rgba(212,168,83,0.15)]',
  green: 'bg-[var(--success-soft)] text-[var(--success)] border-[rgba(78,173,107,0.15)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-[rgba(78,173,107,0.15)]',
  coral: 'bg-[var(--error-soft)] text-[var(--error)] border-[rgba(224,85,85,0.15)]',
  error: 'bg-[var(--error-soft)] text-[var(--error)] border-[rgba(224,85,85,0.15)]',
  amber: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[rgba(212,168,83,0.15)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[rgba(212,168,83,0.15)]',
  purple: 'bg-[rgba(139,92,246,0.08)] text-[#7c3aed] border-[rgba(139,92,246,0.15)]',
  cyan: 'bg-[rgba(6,182,212,0.08)] text-[#0891b2] border-[rgba(6,182,212,0.15)]',
  info: 'bg-[var(--info-soft)] text-[var(--info)] border-[rgba(91,155,213,0.15)]',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-block text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-[4px] uppercase border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
