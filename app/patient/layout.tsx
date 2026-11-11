import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import PatientBottomNav from './_components/PatientBottomNav';

export const metadata: Metadata = {
  title: 'Hasta Portalı — DentaPanel',
  description: 'Kişisel randevu, tedavi planı ve check-in portalı',
};

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-[480px] mx-auto bg-(--color-bg-base) relative shadow-sm overflow-x-hidden">
      <div className="flex-1 pb-24 w-full min-w-0">
        {children}
      </div>
      <PatientBottomNav />
    </div>
  );
}
