'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, Layers, Users, DoorOpen,
  ChevronRight, LogOut, Settings, Bell,
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';
import { Avatar } from '@/app/_components/ui/Avatar';

const navItems = [
  { href: '/admin/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/admin/hospital-setup', label: 'Hastane Ayarları', icon: Building2 },
  { href: '/admin/departments',    label: 'Departmanlar',     icon: Layers },
  { href: '/admin/staff',          label: 'Personel',         icon: Users },
  { href: '/admin/meta',          label: 'Meta Entegrasyonu',           icon: DoorOpen },

];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border-subtle)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-sm shadow-[var(--shadow-glow-primary)]">
          +
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">
            Medi<span className="text-[var(--color-primary)]">Panel</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Admin Paneli</p>
        </div>
      </div>

      {/* Hospital badge */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <p className="text-[10px] text-[var(--color-text-muted)] mb-0.5">Aktif Hastane</p>
        <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">Özel Medikum</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`admin-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 divider" />

      {/* Settings */}
      <div className="px-3 py-3 space-y-0.5">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-secondary)] transition-colors">
          <Settings size={16} />
          <span>Sistem Ayarları</span>
        </button>
      </div>

      {/* User */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] flex items-center gap-3">
        <Avatar firstName="Kemal" lastName="Arslan" size="sm" online />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">Kemal Arslan</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Hastane Yöneticisi</p>
        </div>
        <Link href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors p-1" aria-label="Çıkış">
          <LogOut size={14} />
        </Link>
      </div>
    </aside>
  );
}
