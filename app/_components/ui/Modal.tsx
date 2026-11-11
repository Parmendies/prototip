'use client';

import { cn } from '@/app/_lib/utils';
import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative w-full rounded-2xl border border-(--color-border)',
          'bg-(--color-bg-surface) shadow-[0_24px_80px_hsl(222,47%,4%,0.8)]',
          'animate-scale-in',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-(--color-border-subtle)">
            <div className="min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-bold text-(--color-text-primary) truncate"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-(--color-text-secondary) mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className={cn(
                'shrink-0 w-11 h-11 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer',
                'text-(--color-text-secondary) hover:text-(--color-text-primary)',
                'hover:bg-(--color-bg-elevated) active:scale-95'
              )}
              aria-label="Kapat"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-(--color-border-subtle)">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
