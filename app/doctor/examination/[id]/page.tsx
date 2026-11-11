import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import { notFound } from 'next/navigation';
import ExaminationClient from './ExaminationClient';

export const dynamic = 'force-dynamic';

export default async function ExaminationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireDoctor();
  const { id: appointmentId } = await params;

  // 1. Fetch Appointment and Patient
  const [aptRow] = await db
    .select({
      appointment: schema.appointments,
      patient: schema.patients,
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .where(
      and(
        eq(schema.appointments.id, appointmentId),
        eq(schema.appointments.doctorId, session.doctorId)
      )
    )
    .limit(1);

  if (!aptRow) {
    notFound();
  }

  const { appointment, patient } = aptRow;

  // 2. Fetch Existing Tooth Records for this patient
  const toothRecords = await db
    .select()
    .from(schema.toothRecords)
    .where(eq(schema.toothRecords.patientId, patient.id));

  // 3. Fetch Treatment Plan & Steps
  const [treatmentPlan] = await db
    .select()
    .from(schema.treatmentPlans)
    .where(
      and(
        eq(schema.treatmentPlans.patientId, patient.id),
        eq(schema.treatmentPlans.status, 'active')
      )
    )
    .orderBy(desc(schema.treatmentPlans.createdAt))
    .limit(1);

  let treatmentSteps: any[] = [];
  if (treatmentPlan) {
    treatmentSteps = await db
      .select()
      .from(schema.treatmentSteps)
      .where(eq(schema.treatmentSteps.planId, treatmentPlan.id))
      .orderBy(asc(schema.treatmentSteps.stepOrder));
  }

  // 4. Fetch Procedure Templates for picker
  const procedureTemplates = await db
    .select()
    .from(schema.procedureTemplates)
    .where(eq(schema.procedureTemplates.isActive, true))
    .orderBy(asc(schema.procedureTemplates.sortOrder));

  // 5. Fetch Prescription for this appointment
  const [prescription] = await db
    .select()
    .from(schema.prescriptions)
    .where(eq(schema.prescriptions.appointmentId, appointment.id))
    .limit(1);

  return (
    <ExaminationClient
      appointment={appointment}
      patient={patient}
      existingToothRecords={toothRecords}
      treatmentPlan={treatmentPlan || null}
      treatmentSteps={treatmentSteps}
      procedureTemplates={procedureTemplates}
      prescription={prescription || null}
    />
  );
}

