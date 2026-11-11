// Hekim takvimi doluluk sorguları ve randevu çakışma kontrolü (yalnızca sunucu).
import { db } from '@/db';
import { appointments, doctorProfiles, staffUsers } from '@/db/schema';
import { and, eq, ne, notInArray } from 'drizzle-orm';
import { buildDaySlots, fromMinutes, toMinutes, type BusyRange, type Slot, type WorkingSchedule } from './slots';
import { clinicDateOffset, clinicToday } from './time';
import { MAX_BOOKING_DAYS_AHEAD } from './slots';

/** Takvimde yer tutmayan durumlar */
const NON_BLOCKING_STATUSES = ['cancelled', 'no_show'] as const;

export async function getDoctorScheduleInfo(doctorId: string) {
  const [doc] = await db
    .select({
      id: doctorProfiles.id,
      workingSchedule: doctorProfiles.workingSchedule,
      defaultSlotMinutes: doctorProfiles.defaultSlotMinutes,
      isActive: staffUsers.isActive,
    })
    .from(doctorProfiles)
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(doctorProfiles.id, doctorId))
    .limit(1);
  return doc ?? null;
}

export async function getBusyRanges(
  doctorId: string,
  date: string,
  excludeAppointmentId?: string
): Promise<BusyRange[]> {
  const rows = await db
    .select({ start: appointments.startTime, end: appointments.endTime })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.appointmentDate, date),
        notInArray(appointments.status, [...NON_BLOCKING_STATUSES]),
        // Talep revize edilirken randevunun kendi eski saati "dolu" sayılmaz
        excludeAppointmentId ? ne(appointments.id, excludeAppointmentId) : undefined
      )
    );
  return rows;
}

/** Bir hekimin belirli gündeki saat dilimleri (dolu/geçmiş/mola işaretli). */
export async function getDoctorDaySlots(
  doctorId: string,
  date: string,
  durationMin?: number,
  opts: { minLeadMinutes?: number; excludeAppointmentId?: string } = {}
): Promise<{ slots: Slot[]; isWorkingDay: boolean }> {
  const doc = await getDoctorScheduleInfo(doctorId);
  if (!doc || !doc.isActive) return { slots: [], isWorkingDay: false };

  const schedule = doc.workingSchedule as WorkingSchedule | null;
  const busy = await getBusyRanges(doctorId, date, opts.excludeAppointmentId);
  const slots = buildDaySlots({
    schedule,
    date,
    stepMinutes: doc.defaultSlotMinutes,
    durationMin: durationMin ?? doc.defaultSlotMinutes,
    busy,
    minLeadMinutes: opts.minLeadMinutes,
  });
  return { slots, isWorkingDay: slots.length > 0 };
}

/**
 * Randevu yazmadan hemen önce sunucu tarafı doğrulama.
 * Hata mesajı döner; uygunsa null.
 */
export async function validateBookableSlot({
  doctorId,
  date,
  startTime,
  durationMin,
  minLeadMinutes = 0,
  maxDaysAhead = MAX_BOOKING_DAYS_AHEAD,
  excludeAppointmentId,
}: {
  doctorId: string;
  date: string;
  startTime: string;
  durationMin: number;
  minLeadMinutes?: number;
  maxDaysAhead?: number;
  excludeAppointmentId?: string;
}): Promise<string | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}/.test(startTime)) {
    return 'Geçersiz tarih veya saat.';
  }
  if (date < clinicToday()) return 'Geçmiş bir tarihe randevu verilemez.';
  if (date > clinicDateOffset(maxDaysAhead)) return `En fazla ${maxDaysAhead} gün sonrasına randevu alınabilir.`;

  const { slots, isWorkingDay } = await getDoctorDaySlots(doctorId, date, durationMin, {
    minLeadMinutes,
    excludeAppointmentId,
  });
  if (!isWorkingDay) return 'Hekim bu gün çalışmıyor. Lütfen başka bir gün seçiniz.';

  const wanted = fromMinutes(toMinutes(startTime));
  const slot = slots.find((s) => s.time === wanted);
  if (!slot) return 'Seçilen saat hekimin çalışma saatleri dışında.';
  if (slot.reason === 'busy') return 'Bu saat diliminde hekimin başka bir randevusu var. Lütfen farklı bir saat seçiniz.';
  if (slot.reason === 'past') return 'Seçilen saat geçmiş veya çok yakın. Lütfen daha ileri bir saat seçiniz.';
  if (slot.reason === 'break') return 'Seçilen işlem süresi hekimin öğle arasına taşıyor.';
  return null;
}

export function computeEndTime(startTime: string, durationMin: number) {
  return `${fromMinutes(toMinutes(startTime) + durationMin)}:00`;
}
