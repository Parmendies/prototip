'use client';

import { Card } from '@/app/_components/ui/Card';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Button } from '@/app/_components/ui/Button';
import { mockPatients, mockAppointments } from '@/app/_lib/mock-data';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, ChevronRight } from 'lucide-react';
import { formatDate } from '@/app/_lib/utils';

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState('');

  const patients = mockPatients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Hastalarım</h1>
        <p className="text-xs text-[var(--color-text-muted)]">{mockPatients.length} kayıtlı hasta</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Search */}
        <div className="relative mb-5 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Ad, soyad veya telefon ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Patient table */}
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--color-border-subtle)]">
                <tr>
                  {['Hasta', 'Kimlik No', 'Telefon', 'Kan Grubu', 'Son Randevu', 'Durum', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {patients.map(patient => {
                  const lastApt = mockAppointments
                    .filter(a => a.patientId === patient.id)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];

                  return (
                    <tr key={patient.id} className="hover:bg-[var(--color-bg-elevated)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={patient.firstName} lastName={patient.lastName} size="sm" />
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted)]">{patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] font-mono text-xs whitespace-nowrap">
                        {patient.idNumber ? `${patient.idNumber.slice(0, 3)}****${patient.idNumber.slice(-2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap text-xs">
                        {patient.phone}
                      </td>
                      <td className="px-4 py-3">
                        {patient.bloodType ? (
                          <Badge variant="outline" size="xs">{patient.bloodType}</Badge>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--color-text-muted)]">
                        {lastApt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={11} />
                            {formatDate(lastApt.date)}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={patient.status} dot size="xs" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/doctor/patients/${patient.id}`}>
                          <Button variant="ghost" size="xs" iconRight={<ChevronRight size={12} />}>
                            Detay
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
