import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

// =====================================================
// CSS SINIF BİRLEŞTİRİCİ
// =====================================================
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// =====================================================
// TARİH FORMATLAMA
// =====================================================
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy', { locale: tr });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy, HH:mm', { locale: tr });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM', { locale: tr });
}

export function formatDayName(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE', { locale: tr });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Bugün';
  if (isTomorrow(d)) return 'Yarın';
  if (isPast(d)) return formatDistanceToNow(d, { locale: tr, addSuffix: true });
  return formatDate(d);
}

export function formatTime(time: string): string {
  return time; // "09:00" zaten doğru format
}

// Hafta günlerini döndür (bu haftanın Pazartesi'sinden başlayarak)
export function getWeekDays(offset = 0): Date[] {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// =====================================================
// METİN YARDIMCILARI
// =====================================================
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

// =====================================================
// RENK YARDIMCILARI
// =====================================================
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    confirmed:  'text-(--color-success) bg-(--color-success-muted)',
    pending:    'text-(--color-warning) bg-(--color-warning-muted)',
    in_progress:'text-(--color-primary) bg-(--color-primary-muted)',
    completed:  'text-(--color-text-secondary) bg-(--color-bg-elevated)',
    cancelled:  'text-(--color-error) bg-(--color-error-muted)',
    no_show:    'text-(--color-error) bg-(--color-error-muted)',
    active:     'text-(--color-success) bg-(--color-success-muted)',
    inactive:   'text-(--color-text-secondary) bg-(--color-bg-elevated)',
    available:  'text-(--color-success) bg-(--color-success-muted)',
    occupied:   'text-(--color-error) bg-(--color-error-muted)',
    maintenance:'text-(--color-warning) bg-(--color-warning-muted)',
  };
  return map[status] ?? 'text-(--color-text-secondary) bg-(--color-bg-elevated)';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    confirmed:   'Onaylandı',
    pending:     'Beklemede',
    in_progress: 'Devam Ediyor',
    completed:   'Tamamlandı',
    cancelled:   'İptal Edildi',
    no_show:     'Gelmedi',
    active:      'Aktif',
    inactive:    'Pasif',
    available:   'Müsait',
    occupied:    'Dolu',
    maintenance: 'Bakımda',
    face_to_face:'Yüz Yüze',
    online:      'Online',
  };
  return map[status] ?? status;
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    super_admin:    'Süper Admin',
    hospital_admin: 'Hastane Yöneticisi',
    doctor:         'Doktor',
    secretary:      'Sekreter',
    patient:        'Hasta',
  };
  return map[role] ?? role;
}

// =====================================================
// SAYI FORMATLAMA
// =====================================================
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('tr-TR').format(n);
}

export function formatPercent(n: number): string {
  return `%${Math.round(n)}`;
}
