'use server';

import { db } from '@/db';
import { staffUsers, doctorProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createStaffSession, deleteStaffSession } from '@/lib/auth/session';

export async function loginStaffAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'E-posta ve şifre zorunludur.' };
  }

  const [staff] = await db
    .select()
    .from(staffUsers)
    .where(eq(staffUsers.email, email));

  if (!staff || !staff.isActive) {
    return { success: false, error: 'Kullanıcı bulunamadı veya hesap pasif.' };
  }

  const isMatch = await bcrypt.compare(password, staff.passwordHash);
  if (!isMatch) {
    return { success: false, error: 'E-posta veya şifre hatalı.' };
  }

  let doctorId: string | undefined = undefined;

  if (staff.role === 'doctor') {
    const [docProfile] = await db
      .select({ id: doctorProfiles.id })
      .from(doctorProfiles)
      .where(eq(doctorProfiles.staffUserId, staff.id));

    if (docProfile) {
      doctorId = docProfile.id;
    }
  }

  await createStaffSession({
    staffId: staff.id,
    fullName: staff.fullName,
    email: staff.email,
    role: staff.role as 'admin' | 'secretary' | 'doctor',
    doctorId,
  });

  const redirectUrl =
    staff.role === 'doctor' ? '/doctor/workspace' : '/secretary/desk';

  return { success: true, redirectUrl };
}

export async function logoutStaffAction() {
  await deleteStaffSession();
}
