// Yalnızca sunucu tarafında (Server Action / Server Component) kullanılır.
import { db } from '@/db';
import { appointments, doctorProfiles, treatmentPlans, treatmentSteps } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export type PaymentKind = 'initial_exam' | 'session_prepay' | 'same_day_chairside';

export interface ExpectedCharge {
  amount: number;
  title: string;
  kind: PaymentKind;
  /** Tahsilat sonrası 'paid' olarak işaretlenecek tedavi adımları */
  stepIds: string[];
}

type AppointmentLike = Pick<
  typeof appointments.$inferSelect,
  'patientId' | 'doctorId' | 'status' | 'treatmentStepId'
>;

/**
 * Bir randevu için bankoda tahsil edilmesi gereken tutarı sunucu tarafında hesaplar.
 * Tutar asla istemciden alınmaz (sıfır kaçak kuralı).
 *
 * - checked_in_unpaid + seans randevusu  → ilgili tedavi adımının ücreti (session_prepay)
 * - checked_in_unpaid + ilk muayene      → hekimin ön muayene ücreti (initial_exam)
 * - awaiting_chairside_payment           → aktif plandaki ödenmemiş "koltukta" adımlarının toplamı
 */
export async function getExpectedCharge(apt: AppointmentLike): Promise<ExpectedCharge | null> {
  if (apt.status === 'awaiting_chairside_payment') {
    const steps = await getUnpaidChairsideSteps(apt.patientId);
    if (steps.length === 0) return null;
    return {
      amount: steps.reduce((sum, s) => sum + Number(s.price), 0),
      title: steps.length === 1 ? `⚡ ${steps[0].title}` : `⚡ Koltukta Ek İşlem (${steps.length} kalem)`,
      kind: 'same_day_chairside',
      stepIds: steps.map((s) => s.id),
    };
  }

  if (apt.status !== 'checked_in_unpaid') return null;

  if (apt.treatmentStepId) {
    const [step] = await db
      .select({ id: treatmentSteps.id, title: treatmentSteps.title, price: treatmentSteps.price })
      .from(treatmentSteps)
      .where(eq(treatmentSteps.id, apt.treatmentStepId));
    if (step) {
      return { amount: Number(step.price), title: step.title, kind: 'session_prepay', stepIds: [step.id] };
    }
  }

  const [doc] = await db
    .select({ fee: doctorProfiles.initialExamFee })
    .from(doctorProfiles)
    .where(eq(doctorProfiles.id, apt.doctorId));

  return { amount: Number(doc?.fee ?? 0), title: 'Ön Muayene', kind: 'initial_exam', stepIds: [] };
}

export async function getUnpaidChairsideSteps(patientId: string) {
  return db
    .select({ id: treatmentSteps.id, title: treatmentSteps.title, price: treatmentSteps.price })
    .from(treatmentSteps)
    .innerJoin(treatmentPlans, eq(treatmentSteps.planId, treatmentPlans.id))
    .where(
      and(
        eq(treatmentPlans.patientId, patientId),
        eq(treatmentPlans.status, 'active'),
        eq(treatmentSteps.executionMode, 'same_day_chairside'),
        eq(treatmentSteps.status, 'awaiting_payment')
      )
    )
    .orderBy(treatmentSteps.stepOrder);
}
