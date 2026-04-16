'use client';

import { cn } from '@/app/_lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] ' +
    'shadow-[0_0_12px_hsl(172_66%_50%/0.3)] hover:shadow-[0_0_20px_hsl(172_66%_50%/0.5)] font-semibold',
  secondary:
    'bg-[var(--color-secondary)] text-white hover:bg-[hsl(258,60%,68%)] ' +
    'shadow-[0_0_12px_hsl(258_60%_60%/0.3)] hover:shadow-[0_0_20px_hsl(258_60%_60%/0.5)]',
  outline:
    'border border-[var(--color-border)] text-[var(--color-text-primary)] ' +
    'hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-transparent',
  ghost:
    'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] ' +
    'hover:bg-[var(--color-bg-elevated)] bg-transparent',
  danger:
    'bg-[var(--color-error)] text-white hover:bg-[hsl(0,84%,68%)] ' +
    'shadow-[0_0_12px_hsl(0_84%_60%/0.3)]',
  success:
    'bg-[var(--color-success)] text-white hover:bg-[hsl(142,71%,52%)] ' +
    'shadow-[0_0_12px_hsl(142_71%_45%/0.3)]',
};

const sizeStyles: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.97]',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {iconRight && !loading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  );
}
