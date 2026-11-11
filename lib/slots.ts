// Hekim çalışma takvimine göre randevu saat dilimi hesaplama (saf fonksiyonlar — istemci ve sunucuda çalışır).
import { clinicToday, minutesUntilAppointment } from './time';

export interface WorkingSchedule {
  days: number[]; // 0=Paz, 1=Pzt .. 6=Cmt
  startHour: string; // "09:00"
  endHour: string; // "18:00"
  breakStart?: string;
  breakEnd?: string;
}

export interface BusyRange {
  start: string; // "HH:MM" veya "HH:MM:SS"
  end: string;
}

export type SlotUnavailableReason = 'busy' | 'past' | 'break';

export interface Slot {
  time: string; // "HH:MM"
  available: boolean;
  reason?: SlotUnavailableReason;
}

export const DEFAULT_SCHEDULE: WorkingSchedule = {
  days: [1, 2, 3, 4, 5],
  startHour: '09:00',
  endHour: '18:00',
  breakStart: '13:00',
  breakEnd: '14:00',
};

/** Hastanın en fazla kaç gün ileriye randevu talep edebileceği */
export const MAX_BOOKING_DAYS_AHEAD = 60;

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export function isWorkingDay(schedule: WorkingSchedule | null | undefined, date: string) {
  return (schedule ?? DEFAULT_SCHEDULE).days.includes(dayOfWeek(date));
}

/**
 * Bir gün için tüm saat dilimlerini üretir.
 * - Adım aralığı `stepMinutes` (hekimin varsayılan slot süresi), işlem süresi `durationMin`.
 * - Mesai bitişini veya öğle arasını taşan, dolu randevuyla çakışan ya da geçmişte kalan dilimler pasif döner.
 * Çalışma günü değilse boş dizi döner.
 */
export function buildDaySlots({
  schedule,
  date,
  stepMinutes,
  durationMin,
  busy,
  now = new Date(),
  minLeadMinutes = 0,
}: {
  schedule: WorkingSchedule | null | undefined;
  date: string;
  stepMinutes: number;
  durationMin: number;
  busy: BusyRange[];
  now?: Date;
  minLeadMinutes?: number;
}): Slot[] {
  const s = schedule ?? DEFAULT_SCHEDULE;
  if (date < clinicToday(now)) return [];
  if (!s.days.includes(dayOfWeek(date))) return [];

  const dayStart = toMinutes(s.startHour);
  const dayEnd = toMinutes(s.endHour);
  const breakStart = s.breakStart ? toMinutes(s.breakStart) : null;
  const breakEnd = s.breakEnd ? toMinutes(s.breakEnd) : null;
  const step = Math.max(5, stepMinutes || 30);
  const duration = Math.max(5, durationMin || step);
  const busyRanges = busy.map((b) => [toMinutes(b.start), toMinutes(b.end)] as const);
  const isToday = date === clinicToday(now);

  const slots: Slot[] = [];
  for (let t = dayStart; t + duration <= dayEnd; t += step) {
    const end = t + duration;
    const time = fromMinutes(t);

    // Öğle arasına denk gelen başlangıçlar listede hiç gösterilmez
    if (breakStart !== null && breakEnd !== null && t >= breakStart && t < breakEnd) continue;

    let reason: SlotUnavailableReason | undefined;
    if (breakStart !== null && breakEnd !== null && rangesOverlap(t, end, breakStart, breakEnd)) {
      reason = 'break';
    } else if (isToday && minutesUntilAppointment(date, time, now) < minLeadMinutes) {
      reason = 'past';
    } else if (busyRanges.some(([bs, be]) => rangesOverlap(t, end, bs, be))) {
      reason = 'busy';
    }

    slots.push({ time, available: !reason, reason });
  }
  return slots;
}
