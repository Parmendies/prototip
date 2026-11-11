'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  Users,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';
import { logoutStaffAction } from '@/app/(auth)/personel-giris/actions';

const navItems = [
  { href: '/doctor/workspace', label: 'Çalışma Alanı', icon: LayoutDashboard },
  { href: '/doctor/calendar',  label: 'Randevu Takvimi', icon: CalendarDays },
  { href: '/doctor/patients',  label: 'Hasta Dosyaları', icon: Users },
  { href: '/doctor/profile',   label: 'Profilim',        icon: User },
];

export default function DoctorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutStaffAction();
    router.push('/personel-giris');
    router.refresh();
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col h-full bg-(--color-bg-surface) border-r border-(--color-border-subtle)">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-(--color-border-subtle)">
          <div className="w-9 h-9 rounded-xl bg-(--color-primary) text-white flex items-center justify-center font-bold text-lg shadow-sm">
            🦷
          </div>
          <div>
            <p className="text-sm font-bold text-(--color-text-primary) tracking-tight">
              Denta<span className="text-(--color-primary)">Panel</span>
            </p>
            <p className="text-[10px] font-semibold text-(--color-text-muted) uppercase tracking-wider">
              Hekim Çalışma Alanı
            </p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/doctor/workspace' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-(--color-primary) text-white shadow-(--shadow-primary-soft)'
                    : 'text-(--color-text-secondary) hover:bg-(--color-bg-elevated) hover:text-(--color-text-primary)'
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Status Info */}
        <div className="mx-3 my-2 p-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle)">
          <div className="flex items-center gap-2 text-xs font-bold text-(--color-text-primary) mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Klinik Oturumu Aktif</span>
          </div>
          <p className="text-[11px] text-(--color-text-secondary) leading-relaxed">
            Bekleme odası ve tahsilatlar banko ile canlı senkronizedir.
          </p>
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-(--color-border-subtle)">
          <button
            onClick={handleLogout}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
          >
            <LogOut size={16} />
            <span>Güvenli Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-(--color-bg-surface) border-t border-(--color-border-subtle) flex items-center justify-around pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/doctor/workspace' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 px-3 rounded-xl text-[10px] font-semibold transition-all cursor-pointer',
                isActive
                  ? 'text-(--color-primary) font-bold'
                  : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
              )}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 px-3 rounded-xl text-[10px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
        >
          <LogOut size={19} />
          <span>Çıkış</span>
        </button>
      </nav>
    </>
  );
}
