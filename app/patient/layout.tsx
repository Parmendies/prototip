import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import PatientBottomNav from './_components/PatientBottomNav';

export const metadata: Metadata = {
  title: 'Hasta Portalı',
};

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen max-w-[500px] mx-auto bg-[var(--color-bg-base)] relative">
      <div className="flex-1 pb-20">
        {children}
      </div>
      <PatientBottomNav />
    </div>
  );
}
