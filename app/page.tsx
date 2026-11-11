import { redirect } from 'next/navigation';
import { getPatientSession, getStaffSession } from '@/lib/auth/session';

// Ana sayfa bir rol seçme ekranı değildir (IMPLEMENTATION_PLAN 2.3):
// oturuma göre ilgili panele, oturum yoksa hasta girişine yönlendirir.
// Personel kendi kapısını (/personel-giris), danışma tableti /kiosk adresini doğrudan kullanır.
export default async function HomePage() {
  const staff = await getStaffSession();
  if (staff) {
    redirect(staff.role === 'doctor' ? '/doctor/workspace' : '/secretary/desk');
  }

  const patient = await getPatientSession();
  redirect(patient ? '/patient' : '/giris');
}
