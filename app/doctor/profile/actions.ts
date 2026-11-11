'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import { revalidatePath } from 'next/cache';

export async function updateDoctorProfileAction(data: {
  title: string;
  specialty: string;
  roomNumber?: string;
  examinationFee: string;
  biography?: string;
}) {
  const session = await requireDoctor();

  await db
    .update(schema.doctorProfiles)
    .set({
      title: data.title,
      branch: data.specialty,
      initialExamFee: data.examinationFee,
    })
    .where(eq(schema.doctorProfiles.id, session.doctorId));

  revalidatePath('/doctor/profile');
  revalidatePath('/doctor/workspace');
  revalidatePath('/patient/book');
  return { success: true };
}
