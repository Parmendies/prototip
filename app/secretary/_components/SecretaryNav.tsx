'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Users, Wallet, Settings, MonitorSmartphone } from 'lucide-react';

const ITEMS = [
  { href: '/secretary/desk', label: 'Canlı Masa', icon: LayoutDashboard },
  { href: '/secretary/requests', label: 'Ön Talepler', icon: Inbox },
  { href: '/secretary/patients', label: 'Hastalar', icon: Users },
  { href: '/secretary/kasa', label: 'Kasa Raporu', icon: Wallet },
  { href: '/secretary/settings', label: 'Ayarlar', icon: Settings },
];

export function SecretaryNav({ variant }: { variant: 'desktop' | 'mobile' }) {
  const pathname = usePathname();

  const items = ITEMS.map(({ href, label, icon: Icon }) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`min-h-[44px] px-3 py-2 rounded-xl inline-flex items-center gap-2 whitespace-nowrap transition-colors ${
          active
            ? 'bg-(--color-primary-muted) text-(--color-primary)'
            : 'text-(--color-text-secondary) hover:bg-(--color-bg-elevated) hover:text-(--color-text-primary)'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </Link>
    );
  });

  const kiosk = (
    <Link
      href="/kiosk"
      target="_blank"
      className="min-h-[44px] px-3 py-2 rounded-xl inline-flex items-center gap-2 whitespace-nowrap text-(--color-text-secondary) hover:bg-(--color-bg-elevated)"
      title="Danışma tableti için kiosk ekranını yeni sekmede aç"
    >
      <MonitorSmartphone className="w-4 h-4" />
      <span>Kiosk</span>
    </Link>
  );

  if (variant === 'mobile') {
    return (
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto bg-white border-b border-(--color-border-subtle) px-2 py-1 text-xs font-semibold">
        {items}
        {kiosk}
      </nav>
    );
  }
  return (
    <nav className="hidden lg:flex items-center gap-1 ml-4 text-xs font-semibold">
      {items}
      {kiosk}
    </nav>
  );
}
