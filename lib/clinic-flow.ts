// Randevu akışı için sunucu tarafı ortak kurallar.
// Bu dosya 'use server' DEĞİLDİR: buradaki fonksiyonlar istemciden doğrudan çağrılamaz,
// yalnızca yetki kontrolü yapılmış Server Action'lar içinden kullanılır.
import { db } from '@/db';
import { appointments, treatmentSteps } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { getUnpaidChairsideSteps } from './billing';
import { sendPatientNotification } from './notifications';
import { broadcastChange } from './realtime';

export type Appointment = typeof appointments.$inferSelect;

/** Muayenenin devam ettiği (hekimin işlem yapabildiği) durumlar */
export const ACTIVE_EXAM_STATUSES = ['in_chair', 'awaiting_chairside_payment'] as const;

/** Hekime ait randevuyu getirir; başka hekimin randevusuysa null döner. */
export async function getDoctorAppointment(doctorId: string, appointmentId: string) {
  const [apt] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.doctorId, doctorId)))
    .limit(1);
  return apt ?? null;
}

/**
 * Hekim muayeneyi bitirdiğinde çağrılır.
 * - Ödenmemiş "koltukta" işlem varsa randevu banko tahsilat kilidine alınır (awaiting_chairside_payment).
 *   Kilidi yalnızca banko tahsilatı kaldırır ve randevuyu 'completed' yapar.
 * - Yoksa randevu 'completed' olur; seans randevusuysa ilgili tedavi adımı da tamamlanır.
 */
export async function finishExamination(apt: Appointment): Promise<'locked' | 'completed'> {
  if (!ACTIVE_EXAM_STATUSES.includes(apt.status as (typeof ACTIVE_EXAM_STATUSES)[number])) {
    throw new Error('Bu randevu muayenede değil; tamamlanamaz.');
  }

  const unpaid = await getUnpaidChairsideSteps(apt.patientId);

  if (unpaid.length > 0) {
    await db
      .update(appointments)
      .set({ status: 'awaiting_chairside_payment', updatedAt: new Date() })
      .where(and(eq(appointments.id, apt.id), inArray(appointments.status, [...ACTIVE_EXAM_STATUSES])));

    const total = unpaid.reduce((sum, s) => sum + Number(s.price), 0);
    await sendPatientNotification({
      patientId: apt.patientId,
      type: 'appointment_updated',
      title: '⚡ Çıkışta Ödeme Bekleniyor',
      body: `Koltukta yapılan işlem(ler) için ${total.toLocaleString('tr-TR')} ₺ tutarını çıkışta bankoya ödeyiniz.`,
    });
    await broadcastChange({ doctorId: apt.doctorId, patientId: apt.patientId });
    return 'locked';
  }

  await db.transaction(async (tx) => {
    await tx
      .update(appointments)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(and(eq(appointments.id, apt.id), inArray(appointments.status, [...ACTIVE_EXAM_STATUSES])));

    // Ücreti ödenmiş seans adımı bu randevuyla uygulanmış olur
    if (apt.treatmentStepId) {
      await tx
        .update(treatmentSteps)
        .set({ status: 'completed', completedAt: new Date() })
        .where(and(eq(treatmentSteps.id, apt.treatmentStepId), eq(treatmentSteps.status, 'paid')));
    }
  });

  await sendPatientNotification({
    patientId: apt.patientId,
    type: 'appointment_updated',
    title: '✅ Muayeneniz Tamamlandı',
    body: 'Geçmiş olsun! Tedavi planınız kaydedildi. Çıkışta bankodan bir sonraki seans randevunuzu planlayabilirsiniz.',
  });
  await broadcastChange({ doctorId: apt.doctorId, patientId: apt.patientId });
  return 'completed';
}
