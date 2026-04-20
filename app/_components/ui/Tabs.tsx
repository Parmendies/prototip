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
        'flex gap-1',
        variant === 'underline' && 'border-b border-(--color-border-subtle) gap-0',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200',
              variant === 'default' && [
                'px-3 py-1.5 rounded-lg',
                isActive
                  ? 'bg-(--color-primary-muted) text-(--color-primary)'
                  : 'text-(--color-text-muted) hover:text-(--color-text-secondary) hover:bg-(--color-bg-elevated)',
              ],
              variant === 'pills' && [
                'px-4 py-2 rounded-full',
                isActive
                  ? 'bg-(--color-primary) text-white font-semibold shadow-[0_0_12px_hsl(172_66%_50%/0.3)]'
                  : 'text-(--color-text-primary) hover:text-black',
              ],
              variant === 'underline' && [
                'px-4 py-2.5 border-b-2 -mb-px rounded-none',
                isActive
                  ? 'border-(--color-primary) text-white'
                  : 'border-transparent text-(--color-text-muted) hover:text-(--color-text-secondary)',
              ]
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
                isActive
                  ? 'bg-white text-(--color-primary)'
                  : 'bg-[var(--color-bg-elevated)] text-(--color-text-primary)'
              )}>
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
