import { redirect } from 'next/navigation';
import { getPatientSession, getStaffSession, PatientSessionPayload, StaffSessionPayload } from './session';

export async function requirePatient(): Promise<PatientSessionPayload> {
  const session = await getPatientSession();
  if (!session) {
    redirect('/giris');
  }
  return session;
}

export async function requireSecretaryOrAdmin(): Promise<StaffSessionPayload> {
  const session = await getStaffSession();
  if (!session || (session.role !== 'secretary' && session.role !== 'admin')) {
    redirect('/personel-giris');
  }
  return session;
}

export async function requireDoctor(): Promise<StaffSessionPayload & { doctorId: string }> {
  const session = await getStaffSession();
  if (!session || session.role !== 'doctor' || !session.doctorId) {
    redirect('/personel-giris');
  }
  return session as StaffSessionPayload & { doctorId: string };
}

export async function requireStaff(): Promise<StaffSessionPayload> {
  const session = await getStaffSession();
  if (!session) {
    redirect('/personel-giris');
  }
  return session;
}

