'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Pill,
  Clock,
  Sparkles,
  Stethoscope,
  Heart,
  FileText,
  User,
} from 'lucide-react';

const CONDITIONS: Record<
  string,
  { label: string; icon: string; bg: string; text: string }
> = {
  healthy: { label: 'Sağlam', icon: '🟢', bg: 'bg-emerald-50 text-emerald-700', text: 'emerald' },
  caries: { label: 'Çürük', icon: '🔴', bg: 'bg-rose-50 text-rose-700', text: 'rose' },
  filling: { label: 'Dolgulu', icon: '🔵', bg: 'bg-blue-50 text-blue-700', text: 'blue' },
  root_canal: { label: 'Kanal Tedavili', icon: '🟠', bg: 'bg-amber-50 text-amber-700', text: 'amber' },
  implant: { label: 'İmplant', icon: '🟣', bg: 'bg-purple-50 text-purple-700', text: 'purple' },
  crown: { label: 'Kron / Kaplama', icon: '🔷', bg: 'bg-sky-50 text-sky-700', text: 'sky' },
  missing: { label: 'Eksik Diş', icon: '⚪', bg: 'bg-slate-100 text-slate-500', text: 'slate' },
  extraction_needed: { label: 'Çekim Gerekiyor', icon: '🔻', bg: 'bg-red-100 text-red-800', text: 'red' },
};

export default function PatientDetailClient({
  patient,
  toothRecords,
  treatmentPlans,
  appointments,
  prescriptions,
}: {
  patient: any;
  toothRecords: any[];
  treatmentPlans: any[];
  appointments: any[];
  prescriptions: any[];
}) {
  const [activeTab, setActiveTab] = useState<'teeth' | 'plans' | 'rx' | 'history'>('teeth');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-(--color-bg-base)">
      {/* Header */}
      <header className="px-6 py-4 border-b border-(--color-border-subtle) bg-(--color-bg-surface) flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link href="/doctor/patients" aria-label="Geri Dön" className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-elevated) transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <Avatar firstName={patient.firstName} lastName={patient.lastName} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-(--color-text-primary)">
                {patient.firstName} {patient.lastName}
              </h1>
            </div>
            <p className="text-xs text-(--color-text-muted) font-mono tabular-nums">
              Tel: {patient.phone} • TC: {patient.tcIdentityNo || 'Belirtilmedi'}
            </p>
          </div>
        </div>

        {patient.medicalAlertNote && (
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
            <Heart size={15} className="text-rose-600 fill-rose-600/20 shrink-0" />
            <span>Tıbbi Uyarı: {patient.medicalAlertNote}</span>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="px-6 bg-(--color-bg-surface) border-b border-(--color-border-subtle) flex items-center gap-2 sm:gap-6 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('teeth')}
          className={`py-3.5 px-2 min-h-[44px] font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'teeth'
              ? 'border-(--color-primary) text-(--color-primary)'
              : 'border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)'
          }`}
        >
          <span>🦷</span> Diş Haritası Kayıtları {toothRecords.length > 0 && <span className="font-mono tabular-nums">({toothRecords.length})</span>}
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`py-3.5 px-2 min-h-[44px] font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'plans'
              ? 'border-(--color-primary) text-(--color-primary)'
              : 'border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)'
          }`}
        >
          <span>📋</span> Tedavi Planları {treatmentPlans.length > 0 && <span className="font-mono tabular-nums">({treatmentPlans.length})</span>}
        </button>

        <button
          onClick={() => setActiveTab('rx')}
          className={`py-3.5 px-2 min-h-[44px] font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rx'
              ? 'border-(--color-primary) text-(--color-primary)'
              : 'border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)'
          }`}
        >
          <span>💊</span> E-Reçeteler {prescriptions.length > 0 && <span className="font-mono tabular-nums">({prescriptions.length})</span>}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3.5 px-2 min-h-[44px] font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-(--color-primary) text-(--color-primary)'
              : 'border-transparent text-(--color-text-muted) hover:text-(--color-text-primary)'
          }`}
        >
          <span>🗓️</span> Randevu Geçmişi {appointments.length > 0 && <span className="font-mono tabular-nums">({appointments.length})</span>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl">
        {/* TAB 1: TOOTH RECORDS */}
        {activeTab === 'teeth' && (
          <Card padding="md">
            <h2 className="text-sm font-bold text-(--color-text-primary) mb-3">
              FDI Diş Durum Kayıtları
            </h2>
            {toothRecords.length === 0 ? (
              <p className="text-xs text-(--color-text-muted) py-6 text-center">
                Bu hastaya ait kaydedilmiş özel diş durumu bulunmuyor.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {toothRecords.map((t) => {
                  const cond = CONDITIONS[t.condition] || CONDITIONS.healthy;
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-(--color-primary) text-white font-mono font-bold flex items-center justify-center text-sm shrink-0">
                        {t.fdiNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span>{cond.icon}</span>
                          <span className="font-bold text-xs text-(--color-text-primary)">
                            {cond.label}
                          </span>
                        </div>
                        {t.clinicalNote && (
                          <p className="text-[11px] text-(--color-text-muted) mt-1 italic">
                            &ldquo;{t.clinicalNote}&rdquo;
                          </p>
                        )}
                        <p className="text-[10px] text-(--color-text-muted)/70 mt-1">
                          {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* TAB 2: TREATMENT PLANS */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {treatmentPlans.length === 0 ? (
              <Card padding="md" className="text-center py-8">
                <p className="text-xs text-(--color-text-muted)">Henüz oluşturulmuş tedavi planı bulunmuyor.</p>
              </Card>
            ) : (
              treatmentPlans.map((plan) => (
                <Card key={plan.id} padding="md">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-(--color-border-subtle)">
                    <div>
                      <h3 className="text-sm font-bold text-(--color-text-primary)">
                        Tedavi Planı ({plan.status === 'active' ? 'Aktif' : 'Tamamlandı'})
                      </h3>
                      <p className="text-[11px] text-(--color-text-muted)">
                        Kayıt: {new Date(plan.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    {plan.doctorSummaryNote && (
                      <p className="text-xs text-(--color-text-secondary) max-w-md italic">
                        &ldquo;{plan.doctorSummaryNote}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {plan.steps?.map((step: any, idx: number) => (
                      <div
                        key={step.id}
                        className="p-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-(--color-text-primary)">
                              {idx + 1}. {step.title}
                            </span>
                            {step.fdiNumber && (
                              <span className="px-1.5 py-0.5 rounded bg-(--color-bg-surface) text-[10px] font-mono font-bold">
                                #{step.fdiNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-(--color-text-muted) mt-0.5">
                            Süre: {step.durationMin} dk • Durum: {step.status}
                          </p>
                        </div>
                        <span className="font-bold text-(--color-primary)">
                          {Number(step.price).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PRESCRIPTIONS */}
        {activeTab === 'rx' && (
          <div className="space-y-4">
            {prescriptions.length === 0 ? (
              <Card padding="md" className="text-center py-8">
                <p className="text-xs text-(--color-text-muted)">Kayıtlı reçete bulunmuyor.</p>
              </Card>
            ) : (
              prescriptions.map((rx) => (
                <Card key={rx.id} padding="md">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-(--color-border-subtle)">
                    <div>
                      <span className="text-xs font-mono font-bold text-(--color-primary)">
                        {rx.medulaErefNo}
                      </span>
                      <p className="text-xs font-bold text-(--color-text-primary) mt-0.5">
                        Tanı: {rx.diagnosis}
                      </p>
                    </div>
                    <span className="text-[11px] text-(--color-text-muted)">
                      {new Date(rx.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {rx.medications?.map((m: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-(--color-bg-elevated) text-xs">
                        <p className="font-bold text-(--color-text-primary)">
                          {i + 1}. {m.name} ({m.dosage})
                        </p>
                        <p className="text-[11px] text-(--color-text-muted)">{m.frequency}</p>
                        {m.instructions && (
                          <p className="text-[11px] text-(--color-text-secondary) italic mt-0.5">
                            {m.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 4: APPOINTMENTS */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <Card padding="md" className="text-center py-8">
                <p className="text-xs text-(--color-text-muted)">Randevu geçmişi bulunamadı.</p>
              </Card>
            ) : (
              appointments.map((a) => (
                <Card key={a.id} padding="md">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-(--color-text-primary)">
                          {a.appointmentDate} • {a.startTime.slice(0, 5)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-(--color-bg-elevated) text-(--color-text-secondary)">
                          {a.visitType === 'treatment_session' ? 'Tedavi Seansı' : 'İlk Muayene'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                          {a.status}
                        </span>
                      </div>
                      {a.complaintText && (
                        <p className="text-[11px] text-(--color-text-muted) mt-1">
                          Şikayet: &ldquo;{a.complaintText}&rdquo;
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/doctor/examination/${a.id}`}
                      className="inline-flex items-center justify-center min-h-[38px] px-3.5 py-1.5 rounded-lg bg-(--color-primary)/10 text-(--color-primary) font-bold text-xs hover:bg-(--color-primary)/20 transition-colors"
                    >
                      Muayeneyi Aç
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
