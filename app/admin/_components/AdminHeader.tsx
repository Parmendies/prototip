'use client';

import { Bell, Search } from 'lucide-react';
import { Badge } from '@/app/_components/ui/Badge';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-(--color-border-subtle) bg-(--color-bg-surface)">
      <div>
        <h1 className="text-lg font-bold text-(--color-text-primary)">{title}</h1>
        {subtitle && (
          <p className="text-xs text-(--color-text-muted) mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <Search size={14} className="absolute left-3 text-(--color-text-muted)" />
          <input
            type="text"
            placeholder="Ara..."
            className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-primary) w-48 transition-all"
          />
        </div>
        {/* Notifications */}
        <button
          id="admin-header-notifications"
          className="relative p-2 rounded-lg text-(--color-text-muted) hover:bg-(--color-bg-elevated) hover:text-(--color-text-primary) transition-colors"
          aria-label="Bildirimler"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-(--color-error)" />
        </button>
        {/* System status */}
        <Badge status="active" dot size="sm">
          Sistem Aktif
        </Badge>
      </div>
    </header>
  );
}
