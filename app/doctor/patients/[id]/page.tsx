import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import { notFound } from 'next/navigation';
import PatientDetailClient from './PatientDetailClient';

export const dynamic = 'force-dynamic';

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDoctor();
  const { id: patientId } = await params;

  // 1. Fetch Patient
  const [patient] = await db
    .select()
    .from(schema.patients)
    .where(eq(schema.patients.id, patientId))
    .limit(1);

  if (!patient) {
    notFound();
  }

  // 2. Fetch Tooth Records
  const toothRecords = await db
    .select()
    .from(schema.toothRecords)
    .where(eq(schema.toothRecords.patientId, patientId))
    .orderBy(desc(schema.toothRecords.createdAt));

  // 3. Fetch Treatment Plans and their steps
  const plans = await db
    .select()
    .from(schema.treatmentPlans)
    .where(eq(schema.treatmentPlans.patientId, patientId))
    .orderBy(desc(schema.treatmentPlans.createdAt));

  const plansWithSteps = await Promise.all(
    plans.map(async (p) => {
      const steps = await db
        .select()
        .from(schema.treatmentSteps)
        .where(eq(schema.treatmentSteps.planId, p.id))
        .orderBy(schema.treatmentSteps.stepOrder);
      return { ...p, steps };
    })
  );

  // 4. Fetch Appointments
  const appointments = await db
    .select()
    .from(schema.appointments)
    .where(eq(schema.appointments.patientId, patientId))
    .orderBy(desc(schema.appointments.appointmentDate), desc(schema.appointments.startTime));

  // 5. Fetch Prescriptions
  const prescriptions = await db
    .select()
    .from(schema.prescriptions)
    .where(eq(schema.prescriptions.patientId, patientId))
    .orderBy(desc(schema.prescriptions.createdAt));

  return (
    <PatientDetailClient
      patient={patient}
      toothRecords={toothRecords}
      treatmentPlans={plansWithSteps}
      appointments={appointments}
      prescriptions={prescriptions}
    />
  );
}
