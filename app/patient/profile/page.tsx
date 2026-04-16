'use client';

import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Input } from '@/app/_components/ui/Input';
import { mockPatients } from '@/app/_lib/mock-data';
import { Camera, Upload, AlertTriangle, Heart, Edit3, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/app/_lib/utils';

const patient = mockPatients[0];

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','0+','0-'] as const;

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  date: string;
}

const mockDocs: UploadedDoc[] = [
  { id: '1', name: 'Kimlik Ön Yüz.jpg',       type: 'image', date: '2026-03-20' },
  { id: '2', name: 'Sigorta Kartı.pdf',        type: 'pdf',   date: '2026-03-20' },
  { id: '3', name: 'Eski Tahlil Sonucu.pdf',   type: 'pdf',   date: '2026-02-10' },
];

export default function PatientProfilePage() {
  const [editing, setEditing] = useState(false);
  const [bloodType, setBloodType] = useState<string>(patient.bloodType ?? 'A+');
  const [, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    
    <div className="w-full">
         <div>
        <div className="w-150" />
      </div>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-(--color-bg-base)/90 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-(--color-border-subtle)">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-(--color-text-primary)">Profilim</h1>
          <Button
            variant={editing ? 'primary' : 'outline'}
            size="sm"
            icon={editing ? <Check size={14} /> : <Edit3 size={14} />}
            onClick={editing ? handleSave : () => setEditing(true)}
          >
            {editing ? 'Kaydet' : 'Düzenle'}
          </Button>
        </div>
      </div>
      
      <div className="px-4 py-5 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <Avatar firstName={patient.firstName} lastName={patient.lastName} size="xl" />
            {editing && (
              <button
                id="change-photo-btn"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-(--color-primary) flex items-center justify-center text-[hsl(222,47%,7%)] shadow-md"
                aria-label="Fotoğraf değiştir"
              >
                <Camera size={14} />
              </button>
            )}
          </div>
          <p className="text-base font-bold text-(--color-text-primary) mt-3">
            {patient.firstName} {patient.lastName}
          </p>
          <Badge status={patient.status} dot size="sm" className="mt-1" />
        </div>

        {/* Personal info */}
        <Card padding="sm">
          <p className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide mb-3">Kişisel Bilgiler</p>
          <div className="space-y-3">
            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input id="profile-first-name" label="Ad" defaultValue={patient.firstName} />
                  <Input id="profile-last-name" label="Soyad" defaultValue={patient.lastName} />
                </div>
                <Input id="profile-email" label="E-posta" type="email" defaultValue={patient.email} />
                <Input id="profile-phone" label="Telefon" type="tel" defaultValue={patient.phone} />
                <Input id="profile-id-number" label="TC Kimlik / Pasaport No" defaultValue={patient.idNumber} />
                <Input id="profile-birth-date" label="Doğum Tarihi" type="date" defaultValue={patient.birthDate} />
              </>
            ) : (
              <>
                <InfoItem label="Ad Soyad" value={`${patient.firstName} ${patient.lastName}`} />
                <InfoItem label="E-posta" value={patient.email} />
                <InfoItem label="Telefon" value={patient.phone} />
                <InfoItem label="TC No" value={patient.idNumber ? `${patient.idNumber.slice(0,3)}****${patient.idNumber.slice(-2)}` : '—'} />
                <InfoItem label="Doğum" value={patient.birthDate ?? '—'} />
              </>
            )}
          </div>
        </Card>

        {/* Health Stats Row */}
        <div className={cn("grid gap-4", !editing ? "grid-cols-2" : "grid-cols-1")}>
          {/* Blood type */}
          <Card padding="sm" className="h-full">
            <p className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide mb-3">Kan Grubu</p>
            {editing ? (
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(bt => (
                  <button
                    key={bt}
                    onClick={() => setBloodType(bt)}
                    className={cn(
                      'py-2 rounded-xl text-sm font-bold border transition-all',
                      bloodType === bt
                        ? 'border-(--color-error) bg-(--color-error-muted) text-(--color-error)'
                        : 'border-(--color-border) text-(--color-text-muted)'
                    )}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-(--color-error-muted) border border-error/30 flex items-center justify-center shrink-0">
                  <Heart size={14} className="text-(--color-error)" />
                </div>
                <div>
                  <p className="text-xl font-bold text-(--color-text-primary)">{bloodType}</p>
                  <p className="text-[10px] text-(--color-text-muted) uppercase">Grup</p>
                </div>
              </div>
            )}
          </Card>

          {/* Allergies */}
          <Card padding="sm" className="h-full">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-(--color-warning)" />
              <p className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Alerjiler</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.allergies?.map(a => (
                <Badge key={a} variant="warning" size="sm">{a}</Badge>
              ))}
              {editing && (
                <button className="px-2.5 py-0.5 rounded-full text-xs border-2 border-dashed border-(--color-border) text-(--color-text-muted) hover:border-(--color-warning) hover:text-(--color-warning) transition-colors">
                  + Ekle
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* Documents */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wide">Belgelerim</p>
            <button
              id="upload-document-btn"
              className="flex items-center gap-1.5 text-xs text-(--color-primary) hover:text-(--color-primary-light) transition-colors"
            >
              <Upload size={12} /> Yükle
            </button>
          </div>
          <div className="space-y-2">
            {mockDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-(--color-bg-elevated) transition-colors">
                <span className="text-xl">
                  {doc.type === 'pdf' ? '📄' : '🖼️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-(--color-text-primary) truncate">{doc.name}</p>
                  <p className="text-[10px] text-(--color-text-muted)">{doc.date}</p>
                </div>
                <button className="text-xs text-(--color-primary) hover:underline">İndir</button>
              </div>
            ))}
          </div>

          {/* Upload area */}
          <div
            id="doc-upload-drop-area"
            className="mt-3 border-2 border-dashed border-(--color-border) rounded-xl p-4 text-center hover:border-(--color-primary) hover:bg-(--color-primary-muted) transition-all cursor-pointer group"
          >
            <Upload size={18} className="text-(--color-text-muted) group-hover:text-(--color-primary) mx-auto mb-1 transition-colors" />
            <p className="text-xs text-(--color-text-muted) group-hover:text-(--color-primary) transition-colors">
              Röntgen, tahlil veya reçete yükle
            </p>
            <p className="text-[10px] text-(--color-text-muted) mt-0.5">PDF, JPG, PNG — Maks. 10 MB</p>
          </div>
        </Card>

        <div className="pb-6" />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-(--color-text-muted)">{label}</span>
      <span className="text-sm text-(--color-text-primary) font-medium">{value}</span>
    </div>
  );
}
