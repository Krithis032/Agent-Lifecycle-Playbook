import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-hover)] shadow-[0_1px_8px_rgba(212,168,83,0.15)]',
  secondary: 'bg-[var(--surface-hover)] text-[var(--text-2)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--text)]',
  ghost: 'bg-transparent text-[var(--text-3)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-2)]',
  danger: 'bg-[var(--error-soft)] text-[var(--error)] hover:bg-[rgba(224,85,85,0.2)] border border-[rgba(224,85,85,0.15)]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-6 py-3 text-[14px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-sm)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
