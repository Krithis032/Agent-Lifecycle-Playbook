type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--surface-1)] text-[var(--text-tertiary)]',
  brand:   'bg-[var(--brand-soft)] text-[var(--brand-primary)]',
  success: 'bg-[var(--status-success-soft)] text-[var(--status-success)]',
  warning: 'bg-[var(--status-warning-soft)] text-[var(--status-warning)]',
  error:   'bg-[var(--status-error-soft)] text-[var(--status-error)]',
  info:    'bg-[var(--status-info-soft)] text-[var(--status-info)]',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-lg ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
