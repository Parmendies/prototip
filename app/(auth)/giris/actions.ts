'use server';

import { db } from '@/db';
import { patients } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createPatientSession, deletePatientSession } from '@/lib/auth/session';
import { normalizePhone } from '@/lib/phone';

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_MINUTES = 15;

// Telefon numarasını bilen herkes hastanın tam adını göremesin diye maskelenir (KVKK).
function maskName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toLocaleUpperCase('tr-TR') + '***';
}

export type CheckPhoneResult =
  | { status: 'found'; displayName: string; hasPin: boolean }
  | { status: 'not_found' };

export async function checkPatientPhone(phoneInput: string): Promise<CheckPhoneResult> {
  const phone = normalizePhone(phoneInput);
  const [existing] = await db
    .select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      pinHash: patients.pinHash,
    })
    .from(patients)
    .where(eq(patients.phone, phone));

  if (!existing) {
    return { status: 'not_found' };
  }

  return {
    status: 'found',
    displayName: `${maskName(existing.firstName)} ${maskName(existing.lastName)}`,
    hasPin: !!existing.pinHash,
  };
}

export async function loginWithPin(phoneInput: string, pin: string) {
  const phone = normalizePhone(phoneInput);

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: 'PIN 4 haneli sayı olmalıdır.' };
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.phone, phone));

  if (!patient || !patient.pinHash) {
    return { success: false, error: 'Hasta kaydı bulunamadı veya henüz PIN belirlenmedi.' };
  }

  // Geçici kilit (15 dk) — sekreter PIN sıfırlarsa kilit de kalkar
  if (patient.pinLockedUntil && patient.pinLockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((patient.pinLockedUntil.getTime() - Date.now()) / 60_000);
    return {
      success: false,
      error: `Çok fazla hatalı deneme yapıldı. ${minutesLeft} dakika sonra tekrar deneyin veya bankodan PIN sıfırlama isteyin.`,
    };
  }

  const isMatch = await bcrypt.compare(pin, patient.pinHash);

  if (!isMatch) {
    const attempts = patient.failedPinAttempts + 1;

    if (attempts >= MAX_PIN_ATTEMPTS) {
      await db
        .update(patients)
        .set({
          failedPinAttempts: 0,
          pinLockedUntil: new Date(Date.now() + PIN_LOCK_MINUTES * 60_000),
        })
        .where(eq(patients.id, patient.id));

      return {
        success: false,
        error: `Çok fazla hatalı deneme yapıldı. Hesabınız ${PIN_LOCK_MINUTES} dakika kilitlendi; bankodan PIN sıfırlama isteyebilirsiniz.`,
      };
    }

    await db
      .update(patients)
      .set({ failedPinAttempts: attempts })
      .where(eq(patients.id, patient.id));

    return {
      success: false,
      error: `Hatalı PIN. Kalan deneme hakkı: ${MAX_PIN_ATTEMPTS - attempts}`,
    };
  }

  // Reset failed attempts
  await db
    .update(patients)
    .set({ failedPinAttempts: 0, pinLockedUntil: null })
    .where(eq(patients.id, patient.id));

  // Set 30-day session
  await createPatientSession({
    patientId: patient.id,
    phone: patient.phone,
    firstName: patient.firstName,
    lastName: patient.lastName,
  });

  return { success: true };
}

export async function registerOrSetPin({
  phoneInput,
  firstName,
  lastName,
  pin,
  tcIdentityNo,
}: {
  phoneInput: string;
  firstName: string;
  lastName: string;
  pin: string;
  tcIdentityNo?: string;
}) {
  const phone = normalizePhone(phoneInput);

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: 'PIN 4 haneli sayı olmalıdır.' };
  }

  const [existing] = await db
    .select()
    .from(patients)
    .where(eq(patients.phone, phone));

  // GÜVENLİK: PIN'i olan bir hesabın PIN'i bu akışla asla değiştirilemez.
  // Unutulan PIN yalnızca bankodan sıfırlanır (pin_hash = null), ardından hasta yeni PIN belirler.
  if (existing?.pinHash) {
    return {
      success: false,
      error: 'Bu numara zaten kayıtlı. Lütfen PIN kodunuzla giriş yapın; unuttuysanız bankodan sıfırlatabilirsiniz.',
    };
  }

  const pinHash = await bcrypt.hash(pin, 10);
  let patientId: string;
  let sessionFirstName: string;
  let sessionLastName: string;

  if (existing) {
    // Bankonun açtığı veya PIN'i sıfırlanmış hasta: sadece PIN belirlenir, kimlik bilgileri değiştirilmez.
    // Koşullu güncelleme: eşzamanlı iki istekten yalnızca ilki PIN belirleyebilir.
    const updated = await db
      .update(patients)
      .set({
        pinHash,
        failedPinAttempts: 0,
        pinLockedUntil: null,
        tcIdentityNo: existing.tcIdentityNo ?? (tcIdentityNo?.trim() || null),
      })
      .where(and(eq(patients.id, existing.id), isNull(patients.pinHash)))
      .returning({ id: patients.id });

    if (updated.length === 0) {
      return { success: false, error: 'Bu numara için PIN zaten belirlenmiş. Lütfen PIN kodunuzla giriş yapın.' };
    }

    patientId = existing.id;
    sessionFirstName = existing.firstName;
    sessionLastName = existing.lastName;
  } else {
    if (!firstName.trim() || !lastName.trim()) {
      return { success: false, error: 'Ad ve soyad zorunludur.' };
    }

    const [created] = await db
      .insert(patients)
      .values({
        phone,
        pinHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        tcIdentityNo: tcIdentityNo ? tcIdentityNo.trim() : null,
      })
      .returning();

    patientId = created.id;
    sessionFirstName = created.firstName;
    sessionLastName = created.lastName;
  }

  await createPatientSession({
    patientId,
    phone,
    firstName: sessionFirstName,
    lastName: sessionLastName,
  });

  return { success: true };
}

export async function logoutPatientAction() {
  await deletePatientSession();
}

