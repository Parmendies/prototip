import { cn, getStatusColor, getStatusLabel } from '@/app/_lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  status?: string; // otomatik renklendirme için
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:   'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]',
  primary:   'bg-[var(--color-primary-muted)] text-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary-muted)] text-[var(--color-secondary)]',
  success:   'bg-[var(--color-success-muted)] text-[var(--color-success)]',
  warning:   'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
  error:     'bg-[var(--color-error-muted)] text-[var(--color-error)]',
  outline:   'border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  status,
  className,
}: BadgeProps) {
  const content = status ? getStatusLabel(status) : children;
  const colorClass = status ? getStatusColor(status) : variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colorClass,
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full shrink-0',
            size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      {content}
    </span>
  );
}
