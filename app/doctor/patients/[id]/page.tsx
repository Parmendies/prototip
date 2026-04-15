'use client';

import { Card } from '@/app/_components/ui/Card';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Button } from '@/app/_components/ui/Button';
import { Tabs, useTabs } from '@/app/_components/ui/Tabs';
import { Textarea } from '@/app/_components/ui/Input';
import { mockPatients, mockAppointments } from '@/app/_lib/mock-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, Mail, MapPin, Heart,
  AlertTriangle, FileText, Calendar, Pilcrow, User,
} from 'lucide-react';
import { formatDate, getStatusLabel } from '@/app/_lib/utils';
import { use } from 'react';

const tabs = [
  { id: 'overview',     label: 'Genel',        icon: <User size={13} /> },
  { id: 'appointments', label: 'Randevular',   icon: <Calendar size={13} /> },
  { id: 'documents',    label: 'Belgeler',      icon: <FileText size={13} /> },
  { id: 'notes',        label: 'Notlar',        icon: <Pilcrow size={13} /> },
];

const mockDocuments = [
  { id: 'doc-1', name: 'Çekilen EKG Sonucu.pdf',     size: '2.3 MB', date: '2026-04-10', type: 'pdf' },
  { id: 'doc-2', name: 'Kan Tahlili Sonuçları.pdf',  size: '1.8 MB', date: '2026-04-08', type: 'pdf' },
  { id: 'doc-3', name: 'Akciğer Röntgeni.jpg',       size: '4.1 MB', date: '2026-03-22', type: 'image' },
  { id: 'doc-4', name: 'Önceki Tedavi Özeti.docx',   size: '0.9 MB', date: '2026-02-15', type: 'doc' },
];

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find(p => p.id === id);
  if (!patient) notFound();

  const { activeTab, setActiveTab } = useTabs(tabs, 'overview');
  const appointments = mockAppointments.filter(a => a.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center gap-4">
        <Link href="/doctor/patients">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} aria-label="Geri" />
        </Link>
        <Avatar firstName={patient.firstName} lastName={patient.lastName} size="md" online />
        <div className="flex-1">
          <h1 className="text-base font-bold text-[var(--color-text-primary)]">
            {patient.firstName} {patient.lastName}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <Badge status={patient.status} dot size="xs" />
            {patient.bloodType && <Badge variant="outline" size="xs">{patient.bloodType}</Badge>}
            {patient.birthDate && (
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} yaş
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Phone size={13} />}>Ara</Button>
          <Button variant="primary" size="sm" icon={<Calendar size={13} />}>Randevu Al</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <Tabs tabs={tabs} defaultTab="overview" onChange={setActiveTab} variant="underline" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-4">
            {/* Contact */}
            <Card>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">İletişim</p>
              <div className="space-y-2.5">
                <InfoRow icon={<Phone size={13} />} label="Telefon" value={patient.phone} />
                <InfoRow icon={<Mail size={13} />} label="E-posta" value={patient.email} />
                {patient.address && <InfoRow icon={<MapPin size={13} />} label="Adres" value={patient.address} />}
              </div>
              {patient.emergencyContact && (
                <>
                  <div className="my-3 divider" />
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">Acil İletişim</p>
                  <p className="text-sm text-[var(--color-text-primary)]">{patient.emergencyContact.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{patient.emergencyContact.relation} — {patient.emergencyContact.phone}</p>
                </>
              )}
            </Card>

            {/* Medical */}
            <Card>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Tıbbi Bilgiler</p>
              {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Heart size={12} className="text-[var(--color-error)]" />
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">Hastalık Geçmişi</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.medicalHistory.map(h => (
                      <Badge key={h} variant="default" size="xs">{h}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={12} className="text-[var(--color-warning)]" />
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">Alerjiler</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map(a => (
                      <Badge key={a} variant="warning" size="xs">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(!patient.medicalHistory?.length && !patient.allergies?.length) && (
                <p className="text-sm text-[var(--color-text-muted)]">Kayıtlı bilgi yok</p>
              )}
            </Card>

            {/* Summary */}
            <Card>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Özet</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center py-3 rounded-xl bg-[var(--color-bg-elevated)]">
                  <p className="text-xl font-bold text-[var(--color-primary)]">{appointments.length}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Toplam Randevu</p>
                </div>
                <div className="text-center py-3 rounded-xl bg-[var(--color-bg-elevated)]">
                  <p className="text-xl font-bold text-[var(--color-success)]">{appointments.filter(a => a.status === 'completed').length}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Tamamlanan</p>
                </div>
              </div>
              {patient.idNumber && (
                <InfoRow icon={<User size={13} />} label="TC No" value={`${patient.idNumber.slice(0,3)}****${patient.idNumber.slice(-2)}`} />
              )}
            </Card>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-3 max-w-2xl">
            {appointments.map(apt => (
              <Card key={apt.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center p-2 rounded-xl bg-[var(--color-bg-elevated)] min-w-[52px] text-center">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">{apt.startTime}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{apt.date.slice(5)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge status={apt.type} size="xs" />
                        <Badge status={apt.status} dot size="xs" />
                      </div>
                      {apt.complaint && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{apt.complaint}</p>
                      )}
                      {apt.note && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 italic">Not: {apt.note}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">{formatDate(apt.date)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-2 max-w-2xl">
            {mockDocuments.map(doc => (
              <Card key={doc.id} hover className="flex items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center text-lg shrink-0">
                  {doc.type === 'pdf' ? '📄' : doc.type === 'image' ? '🖼️' : '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{doc.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{doc.size} — {formatDate(doc.date)}</p>
                </div>
                <Button variant="outline" size="xs">İndir</Button>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-2xl space-y-4">
            <Textarea
              id="doctor-note"
              label="Yeni Not Ekle"
              placeholder="Bu hasta için tıbbi not girin..."
              rows={4}
            />
            <Button icon={<FileText size={14} />}>Notu Kaydet</Button>

            <div className="mt-6 space-y-3">
              {mockAppointments
                .filter(a => a.patientId === patient.id && a.note)
                .map(a => (
                  <Card key={a.id}>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">{formatDate(a.date)}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{a.note}</p>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[var(--color-text-muted)] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
        <p className="text-xs text-[var(--color-text-secondary)] truncate">{value}</p>
      </div>
    </div>
  );
}
