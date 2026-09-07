import { mockPatients } from '@/app/_lib/mock-data';
import PatientDetailClient from './PatientDetailClient';

export function generateStaticParams() {
  return mockPatients.map((patient) => ({
    id: patient.id,
  }));
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <PatientDetailClient params={params} />;
}
