'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarPlus, CalendarCheck, User } from 'lucide-react';
import { cn } from '@/app/_lib/utils';

const navItems = [
  { href: '/patient/book',         label: 'Randevu Al',  icon: CalendarPlus },
  { href: '/patient/appointments', label: 'Randevularım', icon: CalendarCheck },
  { href: '/patient/profile',      label: 'Profilim',    icon: User },
];

export default function PatientBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-bg-surface/90 backdrop-blur-xl border-t border-(--color-border-subtle) z-40">
      <div className="flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/patient/book' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`patient-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 transition-all duration-200',
                isActive
                  ? 'text-(--color-primary)'
                  : 'text-(--color-text-muted)'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                isActive ? 'bg-(--color-primary-muted)' : 'bg-transparent'
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
