import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ children, hover = false, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--surface-active)] border border-[var(--border)] rounded-[8px] shadow-sm ${paddingStyles[padding]} transition-all duration-200 ${hover ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--accent)] cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
