import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  // Bilinen bir yedek anahtarla imzalanan oturumlar sahte üretilebilir; canlıda zorunlu.
  throw new Error('SESSION_SECRET tanımlı değil.');
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-only-insecure-session-secret'
);

export const PATIENT_COOKIE_NAME = 'dp_patient_session';
export const STAFF_COOKIE_NAME = 'dp_staff_session';

export interface PatientSessionPayload {
  patientId: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export interface StaffSessionPayload {
  staffId: string;
  fullName: string;
  email: string;
  role: 'admin' | 'secretary' | 'doctor';
  doctorId?: string; // Hekim ise doctor_profiles.id
}

// -------------------------------------------------------------
// PATIENT SESSION (30 Günlük HttpOnly Cookie)
// -------------------------------------------------------------
export async function createPatientSession(payload: PatientSessionPayload) {
  const token = await new SignJWT({ ...payload, userType: 'patient' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(PATIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return token;
}

export async function getPatientSession(): Promise<PatientSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PATIENT_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (payload.userType !== 'patient') return null;
    return {
      patientId: payload.patientId as string,
      phone: payload.phone as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
    };
  } catch {
    return null;
  }
}

export async function deletePatientSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PATIENT_COOKIE_NAME);
}

// -------------------------------------------------------------
// STAFF SESSION (12 Saatlik Vardiya Süreli Cookie)
// -------------------------------------------------------------
export async function createStaffSession(payload: StaffSessionPayload) {
  const token = await new SignJWT({ ...payload, userType: 'staff' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  });

  return token;
}

export async function getStaffSession(): Promise<StaffSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (payload.userType !== 'staff') return null;
    return {
      staffId: payload.staffId as string,
      fullName: payload.fullName as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'secretary' | 'doctor',
      doctorId: payload.doctorId as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function deleteStaffSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
}

