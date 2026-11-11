'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import { sendPatientNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { finishExamination, getDoctorAppointment } from '@/lib/clinic-flow';
import { clinicToday } from '@/lib/time';
import { broadcastChange } from '@/lib/realtime';

type ActionResult = { success: true; outcome?: 'locked' | 'completed' } | { success: false; error: string };

export async function callPatientInChair(appointmentId: string): Promise<ActionResult> {
  const doctor = await requireDoctor();

  const apt = await getDoctorAppointment(doctor.doctorId, appointmentId);
  if (!apt) {
    return { success: false, error: 'Randevu bulunamadı veya bu hekime ait değil.' };
  }

  // ÖDEME KAPISI: yalnızca bankoda ödemesi alınmış (waiting_room) bugünkü hasta koltuğa alınabilir
  if (apt.status !== 'waiting_room') {
    return {
      success: false,
      error:
        apt.status === 'checked_in_unpaid'
          ? 'Hastanın ödemesi henüz bankoda alınmadı.'
          : 'Hasta bekleme odasında değil.',
    };
  }
  if (apt.appointmentDate !== clinicToday()) {
    return { success: false, error: 'Yalnızca bugünkü randevular içeri çağrılabilir.' };
  }

  const moved = await db
    .update(schema.appointments)
    .set({ status: 'in_chair', updatedAt: new Date() })
    .where(and(eq(schema.appointments.id, appointmentId), eq(schema.appointments.status, 'waiting_room')))
    .returning({ id: schema.appointments.id });

  if (moved.length === 0) {
    return { success: false, error: 'Hasta zaten içeri alınmış.' };
  }

  const [docProfile] = await db
    .select({ title: schema.doctorProfiles.title })
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.id, doctor.doctorId))
    .limit(1);

  await sendPatientNotification({
    patientId: apt.patientId,
    type: 'appointment_updated',
    title: '👨‍⚕️ Muayene Sıranız Geldi!',
    body: `${docProfile?.title || 'Hekiminiz'} ${doctor.fullName} sizi içeri çağırıyor. Lütfen muayene odasına geçiniz.`,
  });

  await broadcastChange({ doctorId: doctor.doctorId, patientId: apt.patientId });
  revalidatePath('/doctor/workspace');
  revalidatePath('/secretary/desk');
  revalidatePath('/patient');

  redirect(`/doctor/examination/${appointmentId}`);
}

export async function completeAppointmentDirectly(appointmentId: string): Promise<ActionResult> {
  const doctor = await requireDoctor();

  const apt = await getDoctorAppointment(doctor.doctorId, appointmentId);
  if (!apt) {
    return { success: false, error: 'Randevu bulunamadı.' };
  }

  if (apt.status === 'awaiting_chairside_payment') {
    return {
      success: false,
      error: 'Bu randevuda koltukta ek işlem bulunmaktadır. Banko tahsilatı tamamlanmadan kapatılamaz.',
    };
  }
  if (apt.status !== 'in_chair') {
    return { success: false, error: 'Yalnızca koltuktaki hastanın muayenesi tamamlanabilir.' };
  }

  // Ödenmemiş koltuk işlemi varsa kilide alır, yoksa tamamlar
  const outcome = await finishExamination(apt);

  revalidatePath('/doctor/workspace');
  revalidatePath('/secretary/desk');
  revalidatePath('/patient');

  return { success: true, outcome };
}
