'use server';

import { db } from '@/db';
import { doctorProfiles, procedureTemplates, staffUsers } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { requireSecretaryOrAdmin } from '@/lib/auth/dal';
import { createStaticKioskToken } from '@/lib/kiosk-token';
import { getRequestOrigin } from '@/lib/origin';
import type { WorkingSchedule } from '@/lib/slots';
import { revalidatePath } from 'next/cache';

type Result = { success: true } | { success: false; error: string };

export async function getSettingsDataAction() {
  await requireSecretaryOrAdmin();

  const doctors = await db
    .select({
      id: doctorProfiles.id,
      title: doctorProfiles.title,
      branch: doctorProfiles.branch,
      fullName: staffUsers.fullName,
      isActive: staffUsers.isActive,
      initialExamFee: doctorProfiles.initialExamFee,
      defaultSlotMinutes: doctorProfiles.defaultSlotMinutes,
      workingSchedule: doctorProfiles.workingSchedule,
    })
    .from(doctorProfiles)
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .orderBy(asc(staffUsers.fullName));

  const templates = await db
    .select()
    .from(procedureTemplates)
    .orderBy(asc(procedureTemplates.sortOrder), asc(procedureTemplates.name));

  return {
    doctors,
    templates: templates.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    staticCheckinUrl: `${await getRequestOrigin()}/checkin?k=${createStaticKioskToken()}`,
  };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function updateDoctorSettingsAction(input: {
  doctorId: string;
  initialExamFee: number;
  defaultSlotMinutes: number;
  schedule: WorkingSchedule;
}): Promise<Result> {
  await requireSecretaryOrAdmin();
  const { schedule } = input;

  if (!Number.isFinite(input.initialExamFee) || input.initialExamFee < 0 || input.initialExamFee > 1_000_000) {
    return { success: false, error: 'Geçerli bir ön muayene ücreti giriniz.' };
  }
  if (![10, 15, 20, 30, 45, 60].includes(input.defaultSlotMinutes)) {
    return { success: false, error: 'Randevu aralığı 10/15/20/30/45/60 dk olmalıdır.' };
  }
  const days = [...new Set(schedule.days)].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6).sort();
  if (days.length === 0) return { success: false, error: 'En az bir çalışma günü seçiniz.' };
  if (!TIME_RE.test(schedule.startHour) || !TIME_RE.test(schedule.endHour) || schedule.startHour >= schedule.endHour) {
    return { success: false, error: 'Mesai başlangıcı bitişinden önce olmalıdır.' };
  }
  const hasBreak = !!(schedule.breakStart && schedule.breakEnd);
  if (hasBreak) {
    if (!TIME_RE.test(schedule.breakStart!) || !TIME_RE.test(schedule.breakEnd!) || schedule.breakStart! >= schedule.breakEnd!) {
      return { success: false, error: 'Öğle arası saatleri geçersiz.' };
    }
    if (schedule.breakStart! < schedule.startHour || schedule.breakEnd! > schedule.endHour) {
      return { success: false, error: 'Öğle arası mesai saatleri içinde olmalıdır.' };
    }
  }

  const updated = await db
    .update(doctorProfiles)
    .set({
      initialExamFee: input.initialExamFee.toFixed(2),
      defaultSlotMinutes: input.defaultSlotMinutes,
      workingSchedule: {
        days,
        startHour: schedule.startHour,
        endHour: schedule.endHour,
        ...(hasBreak ? { breakStart: schedule.breakStart, breakEnd: schedule.breakEnd } : {}),
      },
    })
    .where(eq(doctorProfiles.id, input.doctorId))
    .returning({ id: doctorProfiles.id });
  if (updated.length === 0) return { success: false, error: 'Hekim bulunamadı.' };

  revalidatePath('/secretary/settings');
  revalidatePath('/patient/book');
  revalidatePath('/doctor/workspace');
  return { success: true };
}

function validateTemplate(t: { name: string; category: string; defaultPrice: number; defaultDurationMin: number }) {
  if (!t.name.trim()) return 'İşlem adı zorunludur.';
  if (!Number.isFinite(t.defaultPrice) || t.defaultPrice < 0) return 'Geçerli bir fiyat giriniz.';
  if (!Number.isInteger(t.defaultDurationMin) || t.defaultDurationMin < 5 || t.defaultDurationMin > 480) {
    return 'Süre 5–480 dk arası olmalıdır.';
  }
  return null;
}

export async function saveProcedureTemplateAction(input: {
  id?: string;
  name: string;
  category: string;
  defaultPrice: number;
  defaultDurationMin: number;
  isActive: boolean;
}): Promise<Result> {
  await requireSecretaryOrAdmin();
  const err = validateTemplate(input);
  if (err) return { success: false, error: err };

  const values = {
    name: input.name.trim().slice(0, 120),
    category: input.category.trim().slice(0, 40) || 'Genel',
    defaultPrice: input.defaultPrice.toFixed(2),
    defaultDurationMin: input.defaultDurationMin,
    isActive: input.isActive,
  };

  if (input.id) {
    const updated = await db
      .update(procedureTemplates)
      .set(values)
      .where(eq(procedureTemplates.id, input.id))
      .returning({ id: procedureTemplates.id });
    if (updated.length === 0) return { success: false, error: 'İşlem bulunamadı.' };
  } else {
    await db.insert(procedureTemplates).values({ ...values, sortOrder: 999 });
  }

  // Katalogdaki fiyat değişikliği mevcut tedavi planlarını DEĞİŞTİRMEZ (planlar kendi fiyatını saklar)
  revalidatePath('/secretary/settings');
  return { success: true };
}
