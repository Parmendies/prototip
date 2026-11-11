'use server';

import { db } from '@/db';
import { appointments, doctorProfiles, patients, staffUsers } from '@/db/schema';
import { and, desc, eq, gte, ilike, inArray, or, sql } from 'drizzle-orm';
import { requireSecretaryOrAdmin } from '@/lib/auth/dal';
import { isValidTrMobile, normalizePhone } from '@/lib/phone';
import { computeEndTime, getDoctorScheduleInfo, validateBookableSlot } from '@/lib/schedule';
import { sendPatientNotification } from '@/lib/notifications';
import { broadcastChange } from '@/lib/realtime';
import { clinicToday } from '@/lib/time';
import { revalidatePath } from 'next/cache';

export async function searchPatientsAction(query: string) {
  await requireSecretaryOrAdmin();
  const q = query.trim().slice(0, 60);
  if (q.length < 2) return [];

  const digits = q.replace(/\D/g, '');
  const conditions = [
    ilike(sql`concat(${patients.firstName}, ' ', ${patients.lastName})`, `%${q}%`),
  ];
  if (digits.length >= 3) {
    conditions.push(ilike(patients.phone, `%${digits.replace(/^0/, '')}%`));
    conditions.push(ilike(patients.tcIdentityNo, `${digits}%`));
  }

  return db
    .select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      phone: patients.phone,
      hasPin: sql<boolean>`${patients.pinHash} IS NOT NULL`,
      isLocked: sql<boolean>`${patients.pinLockedUntil} IS NOT NULL AND ${patients.pinLockedUntil} > now()`,
      medicalAlertNote: patients.medicalAlertNote,
    })
    .from(patients)
    .where(or(...conditions))
    .orderBy(patients.firstName, patients.lastName)
    .limit(15);
}

export async function getPatientAppointmentsAction(patientId: string) {
  await requireSecretaryOrAdmin();
  return db
    .select({
      id: appointments.id,
      date: appointments.appointmentDate,
      startTime: appointments.startTime,
      status: appointments.status,
      visitType: appointments.visitType,
      doctorName: staffUsers.fullName,
      doctorTitle: doctorProfiles.title,
    })
    .from(appointments)
    .innerJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(and(eq(appointments.patientId, patientId), gte(appointments.appointmentDate, clinicToday())))
    .orderBy(appointments.appointmentDate, appointments.startTime)
    .limit(10);
}

export async function createPatientAction(input: {
  firstName: string;
  lastName: string;
  phone: string;
  tcIdentityNo?: string;
  birthDate?: string;
  medicalAlertNote?: string;
}): Promise<{ success: true; patientId: string } | { success: false; error: string }> {
  await requireSecretaryOrAdmin();

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = normalizePhone(input.phone);
  const tc = input.tcIdentityNo?.replace(/\D/g, '') || null;

  if (!firstName || !lastName) return { success: false, error: 'Ad ve soyad zorunludur.' };
  if (!isValidTrMobile(phone)) return { success: false, error: 'Geçerli bir cep telefonu giriniz (05XX XXX XX XX).' };
  if (tc && tc.length !== 11) return { success: false, error: 'TC Kimlik No 11 haneli olmalıdır.' };
  if (input.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    return { success: false, error: 'Geçersiz doğum tarihi.' };
  }

  const [existing] = await db.select({ id: patients.id }).from(patients).where(eq(patients.phone, phone));
  if (existing) return { success: false, error: 'Bu telefon numarasıyla kayıtlı bir hasta zaten var. Aramadan bulabilirsiniz.' };

  // PIN boş bırakılır: hasta ilk girişinde kendi PIN'ini belirler
  const [created] = await db
    .insert(patients)
    .values({
      firstName,
      lastName,
      phone,
      tcIdentityNo: tc,
      birthDate: input.birthDate || null,
      medicalAlertNote: input.medicalAlertNote?.trim().slice(0, 500) || null,
    })
    .returning({ id: patients.id });

  return { success: true, patientId: created.id };
}

/** Telefonla arayan hastaya bankodan doğrudan onaylı ön muayene randevusu. */
export async function bookPhoneAppointmentAction(input: {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  complaintText?: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  await requireSecretaryOrAdmin();

  const [patient] = await db.select({ id: patients.id }).from(patients).where(eq(patients.id, input.patientId));
  if (!patient) return { success: false, error: 'Hasta bulunamadı.' };

  const doc = await getDoctorScheduleInfo(input.doctorId);
  if (!doc || !doc.isActive) return { success: false, error: 'Seçilen hekim aktif değil.' };
  const durationMin = doc.defaultSlotMinutes || 30;

  const [duplicate] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.patientId, input.patientId),
        eq(appointments.doctorId, input.doctorId),
        eq(appointments.appointmentDate, input.date),
        inArray(appointments.status, ['pending_approval', 'confirmed'])
      )
    )
    .limit(1);
  if (duplicate) return { success: false, error: 'Hastanın bu hekime aynı gün için zaten bir randevusu/talebi var.' };

  const slotError = await validateBookableSlot({
    doctorId: input.doctorId,
    date: input.date,
    startTime: input.startTime,
    durationMin,
    maxDaysAhead: 180,
  });
  if (slotError) return { success: false, error: slotError };

  await db.insert(appointments).values({
    patientId: input.patientId,
    doctorId: input.doctorId,
    appointmentDate: input.date,
    startTime: `${input.startTime.slice(0, 5)}:00`,
    endTime: computeEndTime(input.startTime, durationMin),
    durationMin,
    visitType: 'initial_exam',
    status: 'confirmed',
    complaintText: input.complaintText?.trim().slice(0, 1000) || 'Telefonla randevu',
    createdBy: 'secretary',
  });

  await sendPatientNotification({
    patientId: input.patientId,
    type: 'appointment_confirmed',
    title: 'Randevunuz Oluşturuldu',
    body: `${input.date} saat ${input.startTime.slice(0, 5)} randevunuz bankoda oluşturuldu ve onaylandı. Randevu günü danışmadaki QR kodu okutunuz.`,
  });

  await broadcastChange({ doctorId: input.doctorId, patientId: input.patientId });
  revalidatePath('/secretary/desk');
  return { success: true };
}

export async function getRecentPatientsAction() {
  await requireSecretaryOrAdmin();
  return db
    .select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      phone: patients.phone,
      hasPin: sql<boolean>`${patients.pinHash} IS NOT NULL`,
      isLocked: sql<boolean>`${patients.pinLockedUntil} IS NOT NULL AND ${patients.pinLockedUntil} > now()`,
      medicalAlertNote: patients.medicalAlertNote,
    })
    .from(patients)
    .orderBy(desc(patients.createdAt))
    .limit(10);
}
