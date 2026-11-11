'use client';

import { cn } from '@/app/_lib/utils';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
  variant = 'default',
}: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  function handleChange(id: string) {
    setActive(id);
    onChange?.(id);
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-1',
        variant === 'underline' && 'border-b border-(--color-border-subtle) gap-0 py-0',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const hasPositiveBadge = typeof tab.badge === 'number' && tab.badge > 0;

        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 select-none whitespace-nowrap min-h-[44px] cursor-pointer',
              variant === 'default' && [
                'px-3.5 py-2 rounded-xl',
                isActive
                  ? 'bg-(--color-primary-muted) text-(--color-primary) shadow-2xs'
                  : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-elevated)',
              ],
              variant === 'pills' && [
                'px-4 py-2 rounded-full',
                isActive
                  ? 'bg-(--color-primary) text-white font-bold shadow-(--shadow-primary-soft)'
                  : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-elevated)',
              ],
              variant === 'underline' && [
                'px-4 py-3 border-b-2 -mb-px rounded-none',
                isActive
                  ? 'border-(--color-primary) text-(--color-primary) font-bold bg-(--color-primary-muted)/30'
                  : 'border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)',
              ]
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {hasPositiveBadge && (
              <span
                className={cn(
                  'flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-mono font-bold leading-none',
                  isActive
                    ? variant === 'pills'
                      ? 'bg-white text-(--color-primary)'
                      : 'bg-(--color-primary) text-white'
                    : 'bg-(--color-bg-elevated) text-(--color-text-secondary) border border-(--color-border-subtle)'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Kullanım kolaylığı için useTab hook
export function useTabs(tabs: Tab[], defaultTab?: string) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);
  return { activeTab, setActiveTab };
}
