'use server';

import { db } from '@/db';
import {
  appointments,
  doctorProfiles,
  staffUsers,
  treatmentPlans,
  treatmentSteps,
  prescriptions,
  patientNotifications,
  patients,
} from '@/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { requirePatient } from '@/lib/auth/dal';
import { deletePatientSession } from '@/lib/auth/session';
import { getExpectedCharge } from '@/lib/billing';
import { sendPatientNotification } from '@/lib/notifications';
import { broadcastChange } from '@/lib/realtime';
import { clinicToday, minutesUntilAppointment } from '@/lib/time';
import { revalidatePath } from 'next/cache';

/** Onaylı randevu en geç kaç dakika öncesine kadar uygulamadan iptal edilebilir */
const PATIENT_CANCEL_MIN_LEAD_MINUTES = 120;

const FINISHED = ['completed', 'cancelled', 'no_show'];

function canPatientCancel(apt: { status: string; date: string; startTime: string }) {
  if (apt.status === 'pending_approval') return minutesUntilAppointment(apt.date, apt.startTime) > 0;
  if (apt.status === 'confirmed') {
    return minutesUntilAppointment(apt.date, apt.startTime) >= PATIENT_CANCEL_MIN_LEAD_MINUTES;
  }
  return false;
}

export async function getPatientDashboardData() {
  const session = await requirePatient();

  // 1. Patient info
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, session.patientId));

  // 2. Appointments (latest 10)
  const patientAppointments = await db
    .select({
      id: appointments.id,
      date: appointments.appointmentDate,
      startTime: appointments.startTime,
      status: appointments.status,
      visitType: appointments.visitType,
      isEarlyArrival: appointments.isEarlyArrival,
      complaintText: appointments.complaintText,
      doctorName: staffUsers.fullName,
      doctorTitle: doctorProfiles.title,
      doctorBranch: doctorProfiles.branch,
      initialExamFee: doctorProfiles.initialExamFee,
      treatmentStepId: appointments.treatmentStepId,
      doctorId: appointments.doctorId,
    })
    .from(appointments)
    .innerJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(appointments.patientId, session.patientId))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime))
    .limit(20);

  // "En yakın randevu": bugünden itibaren devam eden/gelecek ilk randevu (en uzak değil)
  const today = clinicToday();
  const upcoming = patientAppointments
    .filter((a) => a.date >= today && !FINISHED.includes(a.status))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const next = upcoming[0] ?? null;
  const nextCharge =
    next && (next.status === 'checked_in_unpaid' || next.status === 'awaiting_chairside_payment')
      ? await getExpectedCharge({ ...next, patientId: session.patientId })
      : null;

  // 3. Treatment Plans with Steps
  const plans = await db
    .select({
      id: treatmentPlans.id,
      status: treatmentPlans.status,
      doctorSummaryNote: treatmentPlans.doctorSummaryNote,
      createdAt: treatmentPlans.createdAt,
      doctorName: staffUsers.fullName,
      doctorTitle: doctorProfiles.title,
    })
    .from(treatmentPlans)
    .innerJoin(doctorProfiles, eq(treatmentPlans.doctorId, doctorProfiles.id))
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(treatmentPlans.patientId, session.patientId))
    .orderBy(desc(treatmentPlans.createdAt));

  const plansWithSteps = await Promise.all(
    plans.map(async (plan) => {
      const steps = await db
        .select()
        .from(treatmentSteps)
        .where(eq(treatmentSteps.planId, plan.id))
        .orderBy(treatmentSteps.stepOrder);
      return { ...plan, steps };
    })
  );

  // 4. Prescriptions
  const prescs = await db
    .select({
      id: prescriptions.id,
      medulaErefNo: prescriptions.medulaErefNo,
      medications: prescriptions.medications,
      note: prescriptions.note,
      createdAt: prescriptions.createdAt,
      doctorName: staffUsers.fullName,
      doctorTitle: doctorProfiles.title,
    })
    .from(prescriptions)
    .innerJoin(doctorProfiles, eq(prescriptions.doctorId, doctorProfiles.id))
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(prescriptions.patientId, session.patientId))
    .orderBy(desc(prescriptions.createdAt));

  // 5. Notifications
  const notifications = await db
    .select()
    .from(patientNotifications)
    .where(eq(patientNotifications.patientId, session.patientId))
    .orderBy(desc(patientNotifications.createdAt))
    .limit(10);

  return {
    patient: {
      id: session.patientId,
      name: `${session.firstName} ${session.lastName}`,
      phone: session.phone,
      medicalAlert: patient?.medicalAlertNote || null,
    },
    appointments: patientAppointments.map((a) => ({ ...a, doctorId: undefined, canCancel: canPatientCancel(a) })),
    nextAppointment: next
      ? {
          id: next.id,
          date: next.date,
          startTime: next.startTime,
          status: next.status,
          visitType: next.visitType,
          doctorName: next.doctorName,
          doctorTitle: next.doctorTitle,
          doctorBranch: next.doctorBranch,
          canCancel: canPatientCancel(next),
          dueAmount: nextCharge?.amount ?? null,
          dueTitle: nextCharge?.title ?? null,
        }
      : null,
    treatmentPlans: plansWithSteps,
    prescriptions: prescs,
    notifications,
  };
}

export async function logoutAction() {
  await deletePatientSession();
}


export async function cancelMyAppointmentAction(appointmentId: string) {
  const session = await requirePatient();

  const [apt] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.patientId, session.patientId)));
  if (!apt) return { success: false, error: 'Randevu bulunamadı.' };

  if (!canPatientCancel({ status: apt.status, date: apt.appointmentDate, startTime: apt.startTime })) {
    return {
      success: false,
      error:
        apt.status === 'confirmed'
          ? `Randevuya ${PATIENT_CANCEL_MIN_LEAD_MINUTES / 60} saatten az kaldığı için uygulamadan iptal edilemiyor. Lütfen kliniği arayınız.`
          : 'Bu randevu artık iptal edilemez.',
    };
  }

  const updated = await db
    .update(appointments)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(appointments.id, apt.id), inArray(appointments.status, ['pending_approval', 'confirmed'])))
    .returning({ id: appointments.id });
  if (updated.length === 0) return { success: false, error: 'Randevu durumu değişmiş; sayfayı yenileyiniz.' };

  // Seans randevusuysa tedavi adımı yeniden randevulanabilir
  if (apt.treatmentStepId) {
    await db
      .update(treatmentSteps)
      .set({ status: 'planned' })
      .where(and(eq(treatmentSteps.id, apt.treatmentStepId), eq(treatmentSteps.status, 'scheduled')));
  }

  await sendPatientNotification({
    patientId: session.patientId,
    type: 'appointment_updated',
    title: 'Randevunuzu İptal Ettiniz',
    body: `${apt.appointmentDate} saat ${apt.startTime.slice(0, 5)} randevunuz iptal edildi. Dilediğiniz zaman yeni randevu talep edebilirsiniz.`,
  });

  await broadcastChange({ doctorId: apt.doctorId, patientId: session.patientId });
  revalidatePath('/patient');
  return { success: true };
}
