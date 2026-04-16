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
  default:   'bg-(--color-bg-elevated) text-(--color-text-secondary)',
  primary:   'bg-(--color-primary-muted) text-(--color-primary)',
  secondary: 'bg-(--color-secondary-muted) text-(--color-secondary)',
  success:   'bg-(--color-success-muted) text-(--color-success)',
  warning:   'bg-(--color-warning-muted) text-(--color-warning)',
  error:     'bg-(--color-error-muted) text-(--color-error)',
  outline:   'border border-(--color-border) text-(--color-text-secondary) bg-transparent',
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
