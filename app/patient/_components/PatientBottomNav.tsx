'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2, CalendarPlus, User } from 'lucide-react';
import { cn } from '@/app/_lib/utils';

const navItems = [
  { href: '/patient',         label: 'Randevularım', icon: CalendarCheck2, exact: true },
  { href: '/patient/book',    label: 'Randevu Al',  icon: CalendarPlus,   exact: false },
  { href: '/patient/profile', label: 'Profilim',    icon: User,           exact: false },
];

export default function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white/95 backdrop-blur-xl border-t border-(--color-border-subtle) z-40 shadow-lg">
      <div className="flex items-center justify-around px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? pathname === item.href || pathname === `${item.href}/appointments`
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`patient-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 px-4 rounded-xl transition-all duration-200 select-none group cursor-pointer',
                isActive
                  ? 'text-(--color-primary)'
                  : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
              )}
            >
              <div
                className={cn(
                  'w-11 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'bg-(--color-primary-muted) text-(--color-primary) scale-105 shadow-xs'
                    : 'bg-transparent text-(--color-text-secondary) group-hover:bg-(--color-bg-elevated)'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className={cn(
                'text-[11px] tracking-tight transition-colors',
                isActive ? 'font-bold text-(--color-primary)' : 'font-medium'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
