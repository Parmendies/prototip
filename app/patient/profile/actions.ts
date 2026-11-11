'use server';

import { db } from '@/db';
import { patients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { requirePatient } from '@/lib/auth/dal';
import { revalidatePath } from 'next/cache';

export async function updatePatientPinAction(newPin: string) {
  const session = await requirePatient();

  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: 'Yeni PIN 4 haneli sayı olmalıdır.' };
  }

  const pinHash = await bcrypt.hash(newPin, 10);

  await db
    .update(patients)
    .set({
      pinHash,
      failedPinAttempts: 0,
      pinLockedUntil: null,
    })
    .where(eq(patients.id, session.patientId));

  revalidatePath('/patient/profile');
  return { success: true };
}

