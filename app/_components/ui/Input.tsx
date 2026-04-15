'use client';

import { cn } from '@/app/_lib/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  suffix?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-[var(--color-error)]">*</span>
          )}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[var(--color-text-muted)] flex items-center">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-[var(--color-bg-elevated)] px-3.5 py-2.5',
            'text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
            'border-[var(--color-border)] transition-all duration-150',
            'focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
            'hover:border-[var(--color-bg-overlay)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]',
            prefix && 'pl-10',
            suffix && 'pr-10',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-[var(--color-text-muted)] flex items-center">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-[var(--color-error)]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      )}
    </div>
  );
}

// --- TEXTAREA ---
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text-secondary)]"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-[var(--color-error)]">*</span>
          )}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border bg-[var(--color-bg-elevated)] px-3.5 py-2.5',
          'text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
          'border-[var(--color-border)] transition-all duration-150 resize-none',
          'focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
          'hover:border-[var(--color-bg-overlay)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[var(--color-error)]',
          className
        )}
        rows={props.rows ?? 4}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
}
