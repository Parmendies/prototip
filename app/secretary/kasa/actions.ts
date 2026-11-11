'use server';

import { db } from '@/db';
import { payments, patients, staffUsers, treatmentSteps } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { requireSecretaryOrAdmin } from '@/lib/auth/dal';
import { CLINIC_TZ, clinicToday } from '@/lib/time';

/** Günlük kasa dökümü (klinik saatine göre gün). */
export async function getKasaReportAction(date?: string) {
  await requireSecretaryOrAdmin();
  const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : clinicToday();

  const rows = await db
    .select({
      id: payments.id,
      collectedAt: payments.collectedAt,
      amount: payments.collectedAmount,
      method: payments.method,
      kind: payments.paymentKind,
      note: payments.note,
      patientName: sql<string>`concat(${patients.firstName}, ' ', ${patients.lastName})`,
      stepTitle: treatmentSteps.title,
      staffName: staffUsers.fullName,
    })
    .from(payments)
    .innerJoin(patients, eq(payments.patientId, patients.id))
    .innerJoin(staffUsers, eq(payments.approvedByStaffId, staffUsers.id))
    .leftJoin(treatmentSteps, eq(payments.treatmentStepId, treatmentSteps.id))
    .where(
      and(
        sql`DATE(${payments.collectedAt} AT TIME ZONE ${CLINIC_TZ}) = ${day}`,
        eq(payments.status, 'collected')
      )
    )
    .orderBy(payments.collectedAt);

  const totals = { pos: 0, cash: 0, initial_exam: 0, session_prepay: 0, same_day_chairside: 0 };
  for (const r of rows) {
    const a = Number(r.amount);
    totals[r.method] += a;
    totals[r.kind] += a;
  }

  return {
    date: day,
    rows: rows.map((r) => ({ ...r, amount: Number(r.amount), collectedAt: r.collectedAt.toISOString() })),
    totals: { ...totals, all: totals.pos + totals.cash, count: rows.length },
  };
}
