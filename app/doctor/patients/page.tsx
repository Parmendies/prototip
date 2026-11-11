import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import DoctorPatientsClient from './DoctorPatientsClient';

export const dynamic = 'force-dynamic';

export default async function DoctorPatientsPage() {
  await requireDoctor();

  const patients = await db
    .select({
      id: schema.patients.id,
      firstName: schema.patients.firstName,
      lastName: schema.patients.lastName,
      phone: schema.patients.phone,
      tcIdentityNo: schema.patients.tcIdentityNo,
      birthDate: schema.patients.birthDate,
      medicalAlertNote: schema.patients.medicalAlertNote,
      createdAt: schema.patients.createdAt,
    })
    .from(schema.patients)
    .orderBy(desc(schema.patients.createdAt));

  return <DoctorPatientsClient patients={patients} />;
}
