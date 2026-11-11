'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/_components/ui/Card';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Search, ChevronRight, AlertTriangle } from 'lucide-react';

interface PatientItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  tcIdentityNo: string | null;
  birthDate: string | null;
  medicalAlertNote: string | null;
  createdAt: Date | string;
}

export default function DoctorPatientsClient({ patients }: { patients: PatientItem[] }) {
  const [search, setSearch] = useState('');

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.phone} ${p.tcIdentityNo || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-(--color-bg-base)">
      <div className="px-6 py-4 border-b border-(--color-border-subtle) bg-(--color-bg-surface) flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-(--color-text-primary)">Kayıtlı Hastalar</h1>
          <p className="text-xs text-(--color-text-muted)">Toplam {patients.length} kayıtlı hasta dosyası</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
          <input
            type="text"
            placeholder="Hasta adı, telefon veya TC No ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 min-h-[44px] text-sm rounded-xl bg-(--color-bg-surface) border border-(--color-border-subtle) text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 transition-all"
          />
        </div>

        {/* Patients Table */}
        <Card padding="none" className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-(--color-border-subtle) bg-(--color-bg-elevated)">
                <tr>
                  {['Hasta Adı Soyadı', 'Telefon', 'TC Kimlik', 'Tıbbi Uyarı / Alerji', 'Kayıt Tarihi', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-left font-semibold text-(--color-text-secondary) whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border-subtle)">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-(--color-text-muted)">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={28} className="text-(--color-text-muted)/50" />
                        <p className="text-sm font-medium text-(--color-text-secondary)">Aramanıza uygun hasta kaydı bulunamadı.</p>
                        <p className="text-xs text-(--color-text-muted)">Farklı bir isim, telefon veya kimlik numarası deneyebilirsiniz.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((patient) => (
                    <tr key={patient.id} className="hover:bg-(--color-bg-elevated) transition-colors">
                      <td className="px-4 py-3.5 font-bold text-(--color-text-primary)">
                        <div className="flex items-center gap-2.5">
                          <Avatar firstName={patient.firstName} lastName={patient.lastName} size="sm" />
                          <span className="text-sm">
                            {patient.firstName} {patient.lastName}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono tabular-nums text-sm text-(--color-text-secondary)">
                        {patient.phone}
                      </td>

                      <td className="px-4 py-3.5 font-mono tabular-nums text-xs text-(--color-text-muted)">
                        {patient.tcIdentityNo || '—'}
                      </td>

                      <td className="px-4 py-3.5 max-w-xs truncate">
                        {patient.medicalAlertNote ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200/60 text-rose-700 font-semibold text-xs">
                            <AlertTriangle size={13} className="shrink-0 text-rose-600" />
                            <span className="truncate">{patient.medicalAlertNote}</span>
                          </span>
                        ) : (
                          <span className="text-(--color-text-muted)">Yok</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-(--color-text-muted) tabular-nums">
                        {new Date(patient.createdAt).toLocaleDateString('tr-TR')}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/doctor/patients/${patient.id}`}
                          className="inline-flex items-center justify-center gap-1 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-(--color-primary)/10 text-(--color-primary) font-bold hover:bg-(--color-primary)/20 text-xs transition-colors"
                        >
                          Dosyayı Aç
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
