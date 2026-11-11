import { cn } from '@/app/_lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm:   'p-3',
  md:   'p-4 sm:p-5',
  lg:   'p-5 sm:p-6',
};

export function Card({
  children,
  hover = false,
  glass = false,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border shadow-xs',
        glass
          ? 'glass'
          : 'bg-(--color-bg-surface) border-(--color-border-subtle)',
        hover && 'card-hover cursor-pointer',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// --- CARD HEADER ---
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-(--color-primary-muted) text-(--color-primary) shrink-0 shadow-2xs">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-(--color-text-primary) truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-(--color-text-secondary) mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 flex items-center">{action}</div>}
    </div>
  );
}
