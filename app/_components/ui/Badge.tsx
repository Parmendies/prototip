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
  default:   'bg-(--color-bg-elevated) text-(--color-text-secondary) border border-(--color-border-subtle)',
  primary:   'bg-(--color-primary-muted) text-(--color-primary) border border-(--color-primary)/20 font-semibold',
  secondary: 'bg-(--color-secondary-muted) text-(--color-primary-dark) border border-(--color-secondary)/40 font-semibold',
  success:   'bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold',
  warning:   'bg-amber-100 text-amber-900 border border-amber-200 font-semibold',
  error:     'bg-red-100 text-red-900 border border-red-200 font-semibold',
  outline:   'border border-(--color-border) text-(--color-text-secondary) bg-transparent',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px] gap-1 leading-tight',
  sm: 'px-2.5 py-0.5 text-xs gap-1.5 leading-tight',
  md: 'px-3 py-1 text-xs gap-1.5 leading-tight',
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
