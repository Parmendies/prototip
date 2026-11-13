'use server';

import { db } from '@/db';
import { doctorProfiles, staffUsers, appointments, treatmentPlans, treatmentSteps } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { computeEndTime, getDoctorDaySlots, getDoctorScheduleInfo, validateBookableSlot } from '@/lib/schedule';
import { requirePatient } from '@/lib/auth/dal';
import { sendPatientNotification } from '@/lib/notifications';
import { broadcastChange } from '@/lib/realtime';
import { triageComplaint, type TriageResult } from '@/lib/ai/triage';

export async function getActiveDoctors() {
  const doctors = await db
    .select({
      id: doctorProfiles.id,
      title: doctorProfiles.title,
      branch: doctorProfiles.branch,
      initialExamFee: doctorProfiles.initialExamFee,
      defaultSlotMinutes: doctorProfiles.defaultSlotMinutes,
      workingSchedule: doctorProfiles.workingSchedule,
      fullName: staffUsers.fullName,
    })
    .from(doctorProfiles)
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(staffUsers.isActive, true));

  return doctors;
}

// Hasta başına yapay zekâ önerisi sınırı (süreç belleğinde; kötüye kullanım/maliyet freni)
const TRIAGE_WINDOW_MS = 10 * 60 * 1000;
const TRIAGE_MAX_PER_WINDOW = 8;
const triageCalls = new Map<string, number[]>();

/**
 * Şikayet metnine göre hekim önerir. Öneri üretilemezse (kota, model hatası,
 * çok kısa metin) null döner; istemci hekim listesini önerisiz gösterir.
 */
export async function recommendDoctorForComplaint(complaint: string): Promise<TriageResult | null> {
  const patient = await requirePatient();
  if (typeof complaint !== 'string' || complaint.trim().length < 5) return null;

  const now = Date.now();
  const recent = (triageCalls.get(patient.patientId) ?? []).filter((t) => now - t < TRIAGE_WINDOW_MS);
  if (recent.length >= TRIAGE_MAX_PER_WINDOW) return null;
  recent.push(now);
  triageCalls.set(patient.patientId, recent);

  const doctors = await getActiveDoctors();
  return triageComplaint(
    complaint,
    doctors.map((d) => ({ id: d.id, title: d.title, fullName: d.fullName, branch: d.branch }))
  );
}

/** Hastanın aynı gün için en az kaç dakika sonrasına talep bırakabileceği */
const PATIENT_MIN_LEAD_MINUTES = 60;

/** Hastanın kendi tedavi planındaki, randevu bekleyen seans adımı (yoksa null). */
async function getOwnPlannedSessionStep(patientId: string, stepId: string) {
  const [step] = await db
    .select({
      id: treatmentSteps.id,
      title: treatmentSteps.title,
      price: treatmentSteps.price,
      durationMin: treatmentSteps.durationMin,
      fdiNumber: treatmentSteps.fdiNumber,
      status: treatmentSteps.status,
      executionMode: treatmentSteps.executionMode,
      doctorId: treatmentPlans.doctorId,
    })
    .from(treatmentSteps)
    .innerJoin(treatmentPlans, eq(treatmentSteps.planId, treatmentPlans.id))
    .where(
      and(
        eq(treatmentSteps.id, stepId),
        eq(treatmentPlans.patientId, patientId),
        eq(treatmentPlans.status, 'active')
      )
    )
    .limit(1);
  if (!step || step.status !== 'planned' || step.executionMode !== 'scheduled_session') return null;
  return step;
}

export async function getStepBookingInfo(stepId: string) {
  const patient = await requirePatient();
  const step = await getOwnPlannedSessionStep(patient.patientId, stepId);
  if (!step) return null;
  return {
    id: step.id,
    title: step.title,
    price: Number(step.price),
    durationMin: step.durationMin,
    fdiNumber: step.fdiNumber,
    doctorId: step.doctorId,
  };
}

export async function getAvailableSlots(doctorId: string, date: string, stepId?: string) {
  const patient = await requirePatient();
  let durationMin: number | undefined;
  if (stepId) {
    const step = await getOwnPlannedSessionStep(patient.patientId, stepId);
    if (!step) return { slots: [], isWorkingDay: false };
    durationMin = step.durationMin;
  }
  const { slots, isWorkingDay } = await getDoctorDaySlots(doctorId, date, durationMin, {
    minLeadMinutes: PATIENT_MIN_LEAD_MINUTES,
  });
  return { slots, isWorkingDay };
}

export async function createAppointmentPreRequest({
  doctorId,
  appointmentDate,
  startTime,
  complaintText,
  treatmentStepId,
}: {
  /** Tedavi planındaki bir seans için talep (hekim ve süre adımdan gelir) */
  treatmentStepId?: string;
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  complaintText: string;
}) {
  const patient = await requirePatient();

  const doc = await getDoctorScheduleInfo(doctorId);
  if (!doc || !doc.isActive) {
    return { success: false, error: 'Seçilen hekim şu an randevu kabul etmiyor.' };
  }
  let durationMin = doc.defaultSlotMinutes || 30;

  let sessionStep: Awaited<ReturnType<typeof getOwnPlannedSessionStep>> = null;
  if (treatmentStepId) {
    sessionStep = await getOwnPlannedSessionStep(patient.patientId, treatmentStepId);
    if (!sessionStep) {
      return { success: false, error: 'Bu tedavi adımı için zaten randevu talebi var veya adım randevuya uygun değil.' };
    }
    if (sessionStep.doctorId !== doctorId) {
      return { success: false, error: 'Tedavi seansı, planı oluşturan hekimden alınmalıdır.' };
    }
    durationMin = sessionStep.durationMin || 30;
  }

  // Aynı hekime aynı gün için açık bir talebi/randevusu varsa yenisi açılmaz
  const [duplicate] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.patientId, patient.patientId),
        eq(appointments.doctorId, doctorId),
        eq(appointments.appointmentDate, appointmentDate),
        inArray(appointments.status, ['pending_approval', 'confirmed'])
      )
    )
    .limit(1);
  if (duplicate) {
    return {
      success: false,
      error: 'Bu hekime aynı gün için zaten bir talebiniz/randevunuz var. Değişiklik için bankoyu arayabilirsiniz.',
    };
  }

  // Çalışma saati, mola, geçmiş saat ve süre bazlı çakışma kontrolü
  const slotError = await validateBookableSlot({
    doctorId,
    date: appointmentDate,
    startTime,
    durationMin,
    minLeadMinutes: PATIENT_MIN_LEAD_MINUTES,
  });
  if (slotError) {
    return { success: false, error: slotError };
  }

  const formattedStartTime = `${startTime.slice(0, 5)}:00`;
  let created: { id: string };
  try {
    created = await db.transaction(async (tx) => {
      // Seans talebinde adım kilitlenir (aynı adım için ikinci talep açılamaz).
      // Talep iptal edilirse banko iptali adımı tekrar 'planned' yapar.
      if (sessionStep) {
        const locked = await tx
          .update(treatmentSteps)
          .set({ status: 'scheduled' })
          .where(and(eq(treatmentSteps.id, sessionStep.id), eq(treatmentSteps.status, 'planned')))
          .returning({ id: treatmentSteps.id });
        if (locked.length === 0) throw new Error('STEP_TAKEN');
      }
      const [row] = await tx
        .insert(appointments)
        .values({
          patientId: patient.patientId,
          doctorId,
          treatmentStepId: sessionStep?.id ?? null,
          appointmentDate,
          startTime: formattedStartTime,
          endTime: computeEndTime(startTime, durationMin),
          durationMin,
          visitType: sessionStep ? 'treatment_session' : 'initial_exam',
          status: 'pending_approval',
          complaintText: sessionStep
            ? `Tedavi seansı: ${sessionStep.title}${complaintText.trim() ? ` — ${complaintText.trim().slice(0, 500)}` : ''}`
            : complaintText.trim().slice(0, 1000) || 'Genel Muayene',
          createdBy: 'patient',
        })
        .returning({ id: appointments.id });
      return row;
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'STEP_TAKEN') {
      return { success: false, error: 'Bu tedavi adımı için zaten randevu talebiniz var.' };
    }
    throw err;
  }

  await sendPatientNotification({
    patientId: patient.patientId,
    type: 'appointment_updated',
    title: 'Randevu Ön Talebiniz Alındı',
    body: `${appointmentDate} saat ${startTime.slice(0, 5)} için ön talebiniz alındı. Sekreterimiz sizi telefonla arayacaktır.`,
  });

  await broadcastChange({ doctorId, patientId: patient.patientId });
  return { success: true, appointmentId: created.id };
}
