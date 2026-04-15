'use client';

import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Input, Textarea } from '@/app/_components/ui/Input';
import { mockDoctors, mockDepartments } from '@/app/_lib/mock-data';
import { DOCTOR_TITLES, TIME_SLOTS, WEEK_DAYS } from '@/app/_lib/constants';
import { useState } from 'react';
import { Star, Video, MapPin, GraduationCap, Briefcase, Globe, Check, Edit3 } from 'lucide-react';
import { cn } from '@/app/_lib/utils';

const doctor = mockDoctors[0]; // Prof. Dr. Ahmet Kaya
const dept = mockDepartments.find(d => d.id === doctor.departmentId);

const workDays = WEEK_DAYS.map((day, i) => ({
  day,
  isActive: i < 5,
  slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
}));

export default function DoctorProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Mesleki Profilim</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Hastalara gösterilen bilgilerini güncelle</p>
        </div>
        <Button
          variant={editing ? 'primary' : 'outline'}
          size="sm"
          icon={editing ? <Check size={14} /> : <Edit3 size={14} />}
          onClick={editing ? handleSave : () => setEditing(true)}
        >
          {saved ? 'Kaydedildi!' : editing ? 'Kaydet' : 'Düzenle'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-5 max-w-4xl">

          {/* Left Column */}
          <div className="space-y-4">
            {/* Profile card */}
            <Card className="text-center">
              <Avatar firstName={doctor.firstName} lastName={doctor.lastName} size="xl" className="mx-auto mb-3" online />
              <p className="font-bold text-[var(--color-text-primary)]">
                {doctor.title} {doctor.firstName} {doctor.lastName}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{doctor.specialty}</p>
              {dept && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span style={{ color: dept.color }}>{dept.icon}</span>
                  <span className="text-xs" style={{ color: dept.color }}>{dept.name}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4">
                <StatChip value={doctor.rating} label="Puan" icon={<Star size={10} fill="currentColor" />} color="accent" />
                <StatChip value={doctor.reviewCount} label="Yorum" icon={null} color="primary" />
                <StatChip value={doctor.experienceYears} label="Yıl" icon={null} color="secondary" />
              </div>

              {doctor.availableForOnline && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[var(--color-primary)] text-xs">
                  <Video size={12} /> Online görüşmeye açık
                </div>
              )}
            </Card>

            {/* Room info */}
            <Card>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Konum</p>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <MapPin size={14} className="text-[var(--color-primary)]" />
                <span>{doctor.floor}. Kat — Oda {doctor.roomNumber}</span>
              </div>
            </Card>

            {/* Languages */}
            <Card>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Diller</p>
              <div className="flex flex-wrap gap-1.5">
                {doctor.languages?.map(l => (
                  <div key={l} className="flex items-center gap-1 text-xs">
                    <Globe size={11} className="text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text-secondary)]">{l}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-2 space-y-4">
            {/* Personal & Professional Info */}
            <Card>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">Temel Bilgiler</p>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[var(--color-text-secondary)]">Ünvan</label>
                      <select className="px-3 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]">
                        {DOCTOR_TITLES.map(t => (
                          <option key={t} selected={t === doctor.title}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <Input id="profile-specialty" label="Uzmanlık" defaultValue={doctor.specialty} />
                  </div>
                  <Textarea id="profile-bio" label="Kısa Biyografi" defaultValue={doctor.bio} rows={4} />
                  <Input id="profile-experience" label="Deneyim Yılı" type="number" defaultValue={String(doctor.experienceYears)} />
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)]">
                    <div className={cn(
                      'relative w-10 h-5 rounded-full transition-all cursor-pointer',
                      doctor.availableForOnline ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-overlay)]'
                    )}>
                      <div className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
                        doctor.availableForOnline ? 'left-[22px]' : 'left-0.5'
                      )} />
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)]">Online görüşmeye açık</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{doctor.bio}</p>
                </div>
              )}
            </Card>

            {/* Education */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={14} className="text-[var(--color-secondary)]" />
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Eğitim</p>
              </div>
              <div className="space-y-2">
                {doctor.education?.map((edu, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] mt-1.5 shrink-0" />
                    <p className="text-sm text-[var(--color-text-secondary)]">{edu}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Previous Hospitals */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-[var(--color-primary)]" />
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Önceki Hastaneler</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {doctor.previousHospitals?.map((h, i) => (
                  <Badge key={i} variant="outline" size="sm">{h}</Badge>
                ))}
                {(!doctor.previousHospitals?.length) && (
                  <p className="text-sm text-[var(--color-text-muted)]">Kayıtlı hastane yok</p>
                )}
              </div>
            </Card>

            {/* Working schedule */}
            <Card>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Çalışma Takvimi</p>
              <div className="space-y-2">
                {workDays.map(({ day, isActive, slots }) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className={cn(
                      'w-24 text-xs font-medium shrink-0',
                      isActive ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'
                    )}>
                      {day}
                    </span>
                    {isActive ? (
                      <div className="flex flex-wrap gap-1">
                        {slots.map(s => (
                          <span key={s} className="px-1.5 py-0.5 text-[10px] rounded-md bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--color-text-muted)] italic">Kapalı</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ value, label, icon, color }: { value: number | string; label: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="py-2 rounded-xl bg-[var(--color-bg-elevated)] text-center">
      <div className={`flex items-center justify-center gap-0.5 text-[var(--color-${color})]`}>
        {icon}
        <span className="text-sm font-bold">{value}</span>
      </div>
      <p className="text-[9px] text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
