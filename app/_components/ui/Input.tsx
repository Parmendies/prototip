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
          className="text-sm font-medium text-(--color-text-secondary)"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-(--color-error)">*</span>
          )}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-(--color-text-muted) flex items-center pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full min-h-[44px] rounded-xl border bg-(--color-bg-elevated) px-3.5 py-2.5',
            'text-sm font-medium text-(--color-text-primary) placeholder:text-(--color-text-muted)',
            'border-(--color-border-subtle) transition-all duration-150',
            'focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)',
            'hover:border-(--color-border)',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-(--color-error) focus:border-(--color-error) focus:ring-(--color-error)',
            prefix && 'pl-11',
            suffix && 'pr-11',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-(--color-text-muted) flex items-center pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-(--color-error) mt-0.5">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-(--color-text-muted) mt-0.5">{hint}</p>
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
          className="text-xs font-semibold text-(--color-text-secondary)"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-(--color-error)">*</span>
          )}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border bg-(--color-bg-elevated) px-3.5 py-2.5',
          'text-sm font-medium text-(--color-text-primary) placeholder:text-(--color-text-muted)',
          'border-(--color-border-subtle) transition-all duration-150 resize-none',
          'focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)',
          'hover:border-(--color-border)',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-(--color-error) focus:border-(--color-error) focus:ring-(--color-error)',
          className
        )}
        rows={props.rows ?? 4}
        {...props}
      />
      {error && <p className="text-xs font-medium text-(--color-error) mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-(--color-text-muted) mt-0.5">{hint}</p>}
    </div>
  );
}
