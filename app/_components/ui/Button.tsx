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
    'bg-(--color-primary) text-white hover:bg-(--color-primary-dark) ' +
    'shadow-(--shadow-primary-soft) hover:shadow-md font-semibold cursor-pointer',
  secondary:
    'bg-(--color-primary-muted) text-(--color-primary) hover:bg-(--color-primary)/15 ' +
    'border border-(--color-primary)/20 font-semibold cursor-pointer',
  outline:
    'border border-(--color-border) text-(--color-text-primary) ' +
    'hover:border-(--color-primary) hover:text-(--color-primary) hover:bg-(--color-bg-elevated) bg-transparent font-medium cursor-pointer',
  ghost:
    'text-(--color-text-secondary) hover:text-(--color-text-primary) ' +
    'hover:bg-(--color-bg-elevated) bg-transparent font-medium cursor-pointer',
  danger:
    'bg-(--color-error) text-white hover:bg-red-700 shadow-sm font-semibold cursor-pointer',
  success:
    'bg-(--color-success) text-white hover:bg-emerald-700 shadow-sm font-semibold cursor-pointer',
};

const sizeStyles: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1 min-h-[32px]',
  sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[36px]',
  md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
  lg: 'px-5 py-3 text-base gap-2.5 min-h-[48px]',
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
