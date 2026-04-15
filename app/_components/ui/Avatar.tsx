import { cn, getInitials } from '@/app/_lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  firstName?: string;
  lastName?: string;
  size?: AvatarSize;
  className?: string;
  online?: boolean;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const dotSizeStyles: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 -bottom-0 -right-0',
  sm: 'w-2 h-2 -bottom-0 -right-0',
  md: 'w-2.5 h-2.5 bottom-0 right-0',
  lg: 'w-3 h-3 bottom-0 right-0',
  xl: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
};

// Gradient arka planlar için döngüsel renk atama
const gradients = [
  'from-[hsl(172,66%,40%)] to-[hsl(258,60%,55%)]',
  'from-[hsl(258,60%,50%)] to-[hsl(172,66%,45%)]',
  'from-[hsl(38,92%,50%)] to-[hsl(0,84%,55%)]',
  'from-[hsl(142,71%,40%)] to-[hsl(172,66%,45%)]',
  'from-[hsl(0,84%,55%)] to-[hsl(38,92%,50%)]',
];

function getGradient(name: string) {
  const code = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % gradients.length;
  return gradients[code];
}

export function Avatar({
  src,
  firstName = '',
  lastName = '',
  size = 'md',
  className,
  online,
}: AvatarProps) {
  const initials = getInitials(firstName || '?', lastName || '');
  const gradient = getGradient((firstName || '') + (lastName || ''));

  return (
    <div className={cn('relative shrink-0', className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${firstName} ${lastName}`}
          className={cn(
            'rounded-full object-cover ring-2 ring-[var(--color-border)]',
            sizeStyles[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white',
            'bg-gradient-to-br ring-2 ring-[var(--color-border)]',
            gradient,
            sizeStyles[size]
          )}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute rounded-full ring-2 ring-[var(--color-bg-surface)]',
            online ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]',
            dotSizeStyles[size]
          )}
        />
      )}
    </div>
  );
}
