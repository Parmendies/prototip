import { db } from '@/db';
import { patients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requirePatient } from '@/lib/auth/dal';
import { notFound } from 'next/navigation';
import PatientProfileClient from './PatientProfileClient';

export const dynamic = 'force-dynamic';

export default async function PatientProfilePage() {
  const session = await requirePatient();

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, session.patientId))
    .limit(1);

  if (!patient) {
    notFound();
  }

  return <PatientProfileClient patient={patient} />;
}
