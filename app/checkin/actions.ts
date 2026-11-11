'use server';

import { db } from '@/db';
import { appointments, doctorProfiles, staffUsers } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getPatientSession } from '@/lib/auth/session';
import { sendPatientNotification } from '@/lib/notifications';
import { getExpectedCharge } from '@/lib/billing';
import { clinicToday, minutesUntilAppointment, EARLY_ARRIVAL_THRESHOLD_MIN } from '@/lib/time';
import { cookies } from 'next/headers';
import { broadcastChange } from '@/lib/realtime';
import {
  createPresenceProof,
  PRESENCE_COOKIE,
  PRESENCE_TTL_MS,
  verifyKioskToken,
  verifyPresenceProof,
} from '@/lib/kiosk-token';

/**
 * Hasta klinikte mi? Danışma QR'ındaki imzalı kod (?k=) veya daha önce bu kodla alınmış 30 dk'lık çerez.
 * Geçerli kod görülünce çerez yazılır; böylece PIN girerken QR kodu dönse de check-in yapılabilir.
 */
async function resolvePresence(kioskToken?: string | null): Promise<boolean> {
  const jar = await cookies();
  if (verifyKioskToken(kioskToken)) {
    jar.set(PRESENCE_COOKIE, createPresenceProof(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: PRESENCE_TTL_MS / 1000,
    });
    return true;
  }
  return verifyPresenceProof(jar.get(PRESENCE_COOKIE)?.value);
}

export async function getCheckinDetails(kioskToken?: string | null) {
  const atClinic = await resolvePresence(kioskToken);
  const session = await getPatientSession();
  if (!session) {
    return { loggedIn: false as const, atClinic };
  }

  const todayStr = clinicToday();

  // Find today's active appointment for this patient
  const todayAppointments = await db
    .select({
      id: appointments.id,
      date: appointments.appointmentDate,
      startTime: appointments.startTime,
      status: appointments.status,
      visitType: appointments.visitType,
      isEarlyArrival: appointments.isEarlyArrival,
      treatmentStepId: appointments.treatmentStepId,
      doctorId: appointments.doctorId,
      docTitle: doctorProfiles.title,
      docBranch: doctorProfiles.branch,
      docInitialFee: doctorProfiles.initialExamFee,
      docName: staffUsers.fullName,
    })
    .from(appointments)
    .innerJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(
      and(
        eq(appointments.patientId, session.patientId),
        eq(appointments.appointmentDate, todayStr),
        inArray(appointments.status, [
          'pending_approval',
          'confirmed',
          'checked_in_unpaid',
          'waiting_room',
          'in_chair',
          'awaiting_chairside_payment',
          'completed',
        ])
      )
    )
    .orderBy(appointments.startTime);

  if (todayAppointments.length === 0) {
    return {
      loggedIn: true as const,
      hasAppointment: false as const,
      atClinic,
      patientId: session.patientId,
      patientName: `${session.firstName} ${session.lastName}`,
    };
  }

  // Aynı gün birden fazla randevu varsa: tamamlanmamış ilk randevu, yoksa sonuncusu
  const apt =
    todayAppointments.find((a) => a.status !== 'completed') ??
    todayAppointments[todayAppointments.length - 1];

  // Ödenecek tutar: sunucuda tek kaynaktan hesaplanır (ön muayene / seans / koltukta ek işlem)
  const charge =
    apt.status === 'confirmed' || apt.status === 'pending_approval'
      ? await getExpectedCharge({ ...apt, patientId: session.patientId, status: 'checked_in_unpaid' })
      : await getExpectedCharge({ ...apt, patientId: session.patientId });
  const expectedFee = charge?.amount ?? Number(apt.docInitialFee);
  const feeTitle = charge?.title ?? 'Ön Muayene Ücreti';

  // Erken geliş hesabı klinik saatine (Europe/Istanbul) göre yapılır
  const diffMinutes = minutesUntilAppointment(apt.date, apt.startTime);
  const isEarlyArrival = diffMinutes > EARLY_ARRIVAL_THRESHOLD_MIN;

  return {
    loggedIn: true as const,
    hasAppointment: true as const,
    atClinic,
    patientId: session.patientId,
    patientName: `${session.firstName} ${session.lastName}`,
    appointment: {
      id: apt.id,
      time: apt.startTime.slice(0, 5),
      status: apt.status,
      doctorName: `${apt.docTitle} ${apt.docName}`,
      doctorBranch: apt.docBranch,
      feeTitle,
      expectedFee: Number(expectedFee).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
      isEarlyArrival,
      minutesUntilApt: diffMinutes,
    },
  };
}

export async function confirmCheckinAction(appointmentId: string, kioskToken?: string | null) {
  const session = await getPatientSession();
  if (!session) {
    return { success: false, error: 'Oturum açmanız gerekmektedir.' };
  }

  // Evden check-in yapılamasın: danışmadaki QR kodu okutulmuş olmalı
  if (!(await resolvePresence(kioskToken))) {
    return {
      success: false,
      needsQr: true,
      error: 'Check-in için klinikte danışmadaki QR kodu telefonunuzun kamerasıyla okutunuz.',
    };
  }

  const [apt] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.patientId, session.patientId)));

  if (!apt) {
    return { success: false, error: 'Randevu bulunamadı.' };
  }

  if (apt.status !== 'confirmed') {
    return { success: false, error: `Randevu zaten check-in yapılmış veya uygun durumda değil (Durum: ${apt.status}).` };
  }

  if (apt.appointmentDate !== clinicToday()) {
    return { success: false, error: 'Check-in yalnızca randevu gününde yapılabilir.' };
  }

  const isEarlyArrival =
    minutesUntilAppointment(apt.appointmentDate, apt.startTime) > EARLY_ARRIVAL_THRESHOLD_MIN;

  // Koşullu güncelleme: çift dokunmada ikinci istek etkisiz kalır
  const updated = await db
    .update(appointments)
    .set({
      status: 'checked_in_unpaid',
      checkedInAt: new Date(),
      checkInMethod: 'qr',
      isEarlyArrival,
      updatedAt: new Date(),
    })
    .where(and(eq(appointments.id, appointmentId), eq(appointments.status, 'confirmed')))
    .returning({ id: appointments.id });

  if (updated.length === 0) {
    return { success: false, error: 'Check-in zaten yapılmış.' };
  }

  // Send in-app notification
  await sendPatientNotification({
    patientId: session.patientId,
    type: 'appointment_updated',
    title: 'Giriş / Check-in Yapıldı',
    body: 'Danışma QR check-in işleminiz tamamlandı. Lütfen bankoya geçerek ödemenizi yapınız.',
  });

  await broadcastChange({ doctorId: apt.doctorId, patientId: session.patientId });

  return { success: true };
}

