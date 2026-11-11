'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import { sendPatientNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { broadcastChange } from '@/lib/realtime';
import { ACTIVE_EXAM_STATUSES, finishExamination, getDoctorAppointment } from '@/lib/clinic-flow';

type ActionResult = { success: true } | { success: false; error: string };

const NOT_FOUND = { success: false as const, error: 'Randevu bulunamadı veya size ait değil.' };
const NOT_ACTIVE = { success: false as const, error: 'Bu randevu şu an muayenede değil.' };

function isActiveExam(status: string) {
  return (ACTIVE_EXAM_STATUSES as readonly string[]).includes(status);
}

export async function saveToothCondition(
  appointmentId: string,
  patientId: string,
  fdiNumber: number,
  condition: 'caries' | 'filling' | 'root_canal' | 'implant' | 'crown' | 'missing' | 'extraction_needed' | 'healthy',
  clinicalNote?: string
) {
  const doctor = await requireDoctor();
  const apt = await getDoctorAppointment(doctor.doctorId, appointmentId);
  if (!apt) return NOT_FOUND;
  patientId = apt.patientId; // istemciden gelen hasta kimliğine güvenilmez

  const validFdi = (fdiNumber >= 11 && fdiNumber <= 18) || (fdiNumber >= 21 && fdiNumber <= 28) ||
    (fdiNumber >= 31 && fdiNumber <= 38) || (fdiNumber >= 41 && fdiNumber <= 48);
  if (!validFdi) return { success: false as const, error: 'Geçersiz FDI diş numarası.' };

  // Check if tooth record exists for this patient and tooth
  const [existing] = await db
    .select({ id: schema.toothRecords.id })
    .from(schema.toothRecords)
    .where(
      and(
        eq(schema.toothRecords.patientId, patientId),
        eq(schema.toothRecords.fdiNumber, fdiNumber)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(schema.toothRecords)
      .set({
        condition,
        clinicalNote: clinicalNote || null,
        doctorId: doctor.doctorId,
        appointmentId,
      })
      .where(eq(schema.toothRecords.id, existing.id));
  } else {
    await db.insert(schema.toothRecords).values({
      patientId,
      doctorId: doctor.doctorId,
      appointmentId,
      fdiNumber,
      condition,
      clinicalNote: clinicalNote || null,
    });
  }

  revalidatePath(`/doctor/examination/${appointmentId}`);
  return { success: true };
}

export async function addTreatmentPlanStep(
  appointmentId: string,
  patientId: string,
  stepData: {
    fdiNumber?: number;
    procedureTemplateId?: string;
    title: string;
    price: number;
    durationMin: number;
    executionMode: 'scheduled_session' | 'same_day_chairside';
  }
) {
  const doctor = await requireDoctor();
  const apt = await getDoctorAppointment(doctor.doctorId, appointmentId);
  if (!apt) return NOT_FOUND;
  if (!isActiveExam(apt.status)) return NOT_ACTIVE;
  patientId = apt.patientId;

  if (!stepData.title?.trim() || !Number.isFinite(stepData.price) || stepData.price <= 0) {
    return { success: false as const, error: 'İşlem adı ve geçerli bir ücret giriniz.' };
  }

  // Find or create active treatment plan for this patient
  let [plan] = await db
    .select({ id: schema.treatmentPlans.id })
    .from(schema.treatmentPlans)
    .where(
      and(
        eq(schema.treatmentPlans.patientId, patientId),
        eq(schema.treatmentPlans.status, 'active')
      )
    )
    .orderBy(desc(schema.treatmentPlans.createdAt))
    .limit(1);

  if (!plan) {
    const [newPlan] = await db
      .insert(schema.treatmentPlans)
      .values({
        patientId,
        doctorId: doctor.doctorId,
        sourceAppointmentId: appointmentId,
        status: 'active',
      })
      .returning();
    plan = newPlan;
  }

  // Count existing steps to assign stepOrder
  const existingSteps = await db
    .select({ id: schema.treatmentSteps.id })
    .from(schema.treatmentSteps)
    .where(eq(schema.treatmentSteps.planId, plan.id));

  const stepOrder = existingSteps.length + 1;
  const isChairside = stepData.executionMode === 'same_day_chairside';

  const [insertedStep] = await db
    .insert(schema.treatmentSteps)
    .values({
      planId: plan.id,
      stepOrder,
      fdiNumber: stepData.fdiNumber || null,
      procedureTemplateId: stepData.procedureTemplateId || null,
      title: stepData.title,
      price: stepData.price.toFixed(2),
      durationMin: stepData.durationMin || 30,
      executionMode: stepData.executionMode,
      status: isChairside ? 'awaiting_payment' : 'planned',
    })
    .returning();

  // Koltukta işlem: randevu burada KİLİTLENMEZ. Hasta koltukta kalır; hekim "Muayeneyi Tamamla"
  // dediğinde ödenmemiş koltuk işlemleri varsa banko tahsilat kilidi devreye girer (lib/clinic-flow.ts).
  // Böylece banko, hasta henüz içerideyken tahsilat alıp randevuyu kapatamaz.
  if (isChairside) {
    await sendPatientNotification({
      patientId,
      type: 'appointment_updated',
      title: '⚡ Koltukta Yapılan İşlem Eklendi',
      body: `${stepData.title} (${stepData.price.toLocaleString('tr-TR')} ₺) işlemi yapıldı. Çıkışta bankodan ödeme yapılması gerekmektedir.`,
    });
  }

  await broadcastChange({ patientId });
  revalidatePath(`/doctor/examination/${appointmentId}`);
  revalidatePath('/secretary/desk');
  revalidatePath('/patient');
  return { success: true as const, stepId: insertedStep.id };
}

export async function deleteTreatmentPlanStep(stepId: string, appointmentId: string): Promise<ActionResult> {
  const doctor = await requireDoctor();
  const apt = await getDoctorAppointment(doctor.doctorId, appointmentId);
  if (!apt) return NOT_FOUND;
  if (!isActiveExam(apt.status)) return NOT_ACTIVE;

  const [step] = await db
    .select({ id: schema.treatmentSteps.id, status: schema.treatmentSteps.status })
    .from(schema.treatmentSteps)
    .innerJoin(schema.treatmentPlans, eq(schema.treatmentSteps.planId, schema.treatmentPlans.id))
    .where(and(eq(schema.treatmentSteps.id, stepId), eq(schema.treatmentPlans.patientId, apt.patientId)))
    .limit(1);

  if (!step) return { success: false, error: 'Tedavi adımı bulunamadı.' };

  // Randevusu verilmiş, ödenmiş veya tamamlanmış adım silinemez (kasa / takvim tutarlılığı)
  if (step.status !== 'planned' && step.status !== 'awaiting_payment') {
    return { success: false, error: 'Randevusu verilmiş veya ödemesi alınmış adım silinemez.' };
  }

  await db.delete(schema.treatmentSteps).where(eq(schema.treatmentSteps.id, stepId));

  revalidatePath(`/doctor/examination/${appointmentId}`);
  revalidatePath('/secretary/desk');
  revalidatePath('/patient');
  return { success: true };
}

export async function savePrescriptionRecord(
  appointmentId: string,
  patientId: string,
  prescriptionData: {
    medulaErefNo: string;
    diagnosis: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      notes?: string;
    }>;
    notes?: string;
  }
) {
  const doctor = await requireDoctor();
  const apt = await getDoctorAppointment(doctor.doctorId, appointmentId);
  if (!apt) return NOT_FOUND;
  patientId = apt.patientId;

  const noteText = [prescriptionData.diagnosis ? `Tanı: ${prescriptionData.diagnosis}` : '', prescriptionData.notes || '']
    .filter(Boolean)
    .join(' | ');

  // Check if prescription already exists for this appointment
  const [existing] = await db
    .select({ id: schema.prescriptions.id })
    .from(schema.prescriptions)
    .where(eq(schema.prescriptions.appointmentId, appointmentId))
    .limit(1);

  if (existing) {
    await db
      .update(schema.prescriptions)
      .set({
        medulaErefNo: prescriptionData.medulaErefNo,
        medications: prescriptionData.medications,
        note: noteText || null,
      })
      .where(eq(schema.prescriptions.id, existing.id));
  } else {
    await db.insert(schema.prescriptions).values({
      appointmentId,
      patientId,
      doctorId: doctor.doctorId,
      medulaErefNo: prescriptionData.medulaErefNo,
      medications: prescriptionData.medications,
      note: noteText || null,
    });
  }

  // Notify patient
  await sendPatientNotification({
    patientId,
    type: 'prescription_ready',
    title: '💊 E-Reçeteniz Hazırlandı',
    body: `Medula E-Reçete No: ${prescriptionData.medulaErefNo}. Eczanenizden bu kod ile ilaçlarınızı teslim alabilirsiniz.`,
  });

  await broadcastChange({ patientId });
  revalidatePath(`/doctor/examination/${appointmentId}`);
  revalidatePath('/patient');
  return { success: true };
}

export async function completeExaminationSession(
  appointmentId: string,
  _patientId: string,
  summaryNote?: string
): Promise<ActionResult> {
  const doctor = await requireDoctor();
  const apt = await getDoctorAppointment(doctor.doctorId, appointmentId);
  if (!apt) return NOT_FOUND;
  if (!isActiveExam(apt.status)) return NOT_ACTIVE;

  if (summaryNote) {
    await db
      .update(schema.treatmentPlans)
      .set({ doctorSummaryNote: summaryNote })
      .where(
        and(
          eq(schema.treatmentPlans.patientId, apt.patientId),
          eq(schema.treatmentPlans.status, 'active')
        )
      );
  }

  await finishExamination(apt);

  revalidatePath('/doctor/workspace');
  revalidatePath('/secretary/desk');
  revalidatePath('/patient');
  redirect('/doctor/workspace');
}
