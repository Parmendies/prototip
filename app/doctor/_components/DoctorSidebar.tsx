'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays, Users, UserCircle, LogOut, Video,
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Badge } from '@/app/_components/ui/Badge';

const navItems = [
  { href: '/doctor/calendar', label: 'Takvim',     icon: CalendarDays },
  { href: '/doctor/patients', label: 'Hastalarım', icon: Users },
  { href: '/doctor/profile',  label: 'Profilim',   icon: UserCircle },
];

export default function DoctorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border-subtle)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] flex items-center justify-center text-sm shadow-[var(--shadow-glow-secondary)]">
          👨‍⚕️
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            Medi<span className="text-[var(--color-secondary)]">Panel</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Doktor Paneli</p>
        </div>
      </div>

      {/* Online badge */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center gap-2">
        <Video size={12} className="text-[var(--color-primary)] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[var(--color-text-muted)]">Online görüşme</p>
          <p className="text-xs font-semibold text-[var(--color-success)] truncate">Aktif</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`doctor-nav-${item.label.toLowerCase()}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--color-secondary-muted)] text-[var(--color-secondary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              <Icon size={16} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 divider" />

      {/* Today summary */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-[var(--color-bg-elevated)]">
        <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Bugün</p>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="text-center py-1 rounded-lg bg-[var(--color-bg-surface)]">
            <p className="text-base font-bold text-[var(--color-primary)]">5</p>
            <p className="text-[9px] text-[var(--color-text-muted)]">Randevu</p>
          </div>
          <div className="text-center py-1 rounded-lg bg-[var(--color-bg-surface)]">
            <p className="text-base font-bold text-[var(--color-secondary)]">2</p>
            <p className="text-[9px] text-[var(--color-text-muted)]">Online</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] flex items-center gap-2">
        <Avatar firstName="Ahmet" lastName="Kaya" size="sm" online />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">Prof. Dr. Kaya</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Kardiyoloji</p>
        </div>
        <Link href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors p-1" aria-label="Çıkış">
          <LogOut size={13} />
        </Link>
      </div>
    </aside>
  );
}
