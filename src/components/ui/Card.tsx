import { HTMLAttributes, ReactNode } from 'react';

type CardVariant = 'flat' | 'default' | 'elevated';
type CardPadding = 'none' | 'compact' | 'default' | 'spacious';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  padding?: CardPadding | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<CardVariant, string> = {
  flat: 'bg-[var(--surface-0)] border border-[var(--border-default)] shadow-none',
  default: 'bg-[var(--surface-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-card)]',
  elevated: 'bg-[var(--surface-elevated)] border-none shadow-[var(--shadow-elevated)]',
};

const paddingStyles: Record<string, string> = {
  none: '',
  compact: 'p-3',
  sm: 'p-4',
  default: 'p-5',
  md: 'p-6',
  spacious: 'p-7',
  lg: 'p-8',
};

export default function Card({ children, variant = 'default', hover = false, padding = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-[12px] transition-all duration-200 ${variantStyles[variant]} ${paddingStyles[padding] || ''} ${hover ? 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
