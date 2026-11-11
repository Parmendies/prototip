import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import { notFound } from 'next/navigation';
import DoctorProfileClient from './DoctorProfileClient';

export const dynamic = 'force-dynamic';

export default async function DoctorProfilePage() {
  const session = await requireDoctor();

  const [docProfile] = await db
    .select()
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.id, session.doctorId))
    .limit(1);

  if (!docProfile) {
    notFound();
  }

  const [staff] = await db
    .select()
    .from(schema.staffUsers)
    .where(eq(schema.staffUsers.id, docProfile.staffUserId))
    .limit(1);

  return <DoctorProfileClient doctor={docProfile} staff={staff} />;
}
