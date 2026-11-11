'use client';

import React, { useState } from 'react';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { MapPin, Phone, Mail, Check, Edit3 } from 'lucide-react';
import { updateDoctorProfileAction } from './actions';

export default function DoctorProfileClient({
  doctor,
  staff,
}: {
  doctor: any;
  staff: any;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(doctor.title || 'Dt.');
  const [specialty, setSpecialty] = useState(doctor.branch || 'Genel Diş Hekimliği');
  const [roomNumber, setRoomNumber] = useState('1');
  const [fee, setFee] = useState(doctor.initialExamFee || '800.00');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoctorProfileAction({
        title,
        specialty,
        roomNumber,
        examinationFee: fee,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-(--color-bg-base)">
      <div className="px-6 py-4 border-b border-(--color-border-subtle) bg-(--color-bg-surface) flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-(--color-text-primary)">Mesleki Profilim</h1>
          <p className="text-xs text-(--color-text-muted)">Klinik ve muayene bilgilerinizi yönetin</p>
        </div>
        <Button
          variant={editing ? 'outline' : 'primary'}
          size="sm"
          onClick={() => setEditing(!editing)}
          icon={editing ? undefined : <Edit3 size={14} />}
          className="min-h-[40px] px-4 font-bold rounded-xl"
        >
          {editing ? 'Vazgeç' : 'Profili Düzenle'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl">
        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check size={16} /> Profil bilgileriniz başarıyla güncellendi!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left card */}
          <Card padding="md" className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold text-3xl mx-auto mb-3 border border-(--color-primary)/20">
              👨‍⚕️
            </div>
            <h2 className="text-base font-bold text-(--color-text-primary)">
              {doctor.title} {staff.fullName}
            </h2>
            <p className="text-xs text-(--color-primary) font-semibold mt-0.5">{doctor.branch}</p>

            <div className="mt-4 pt-4 border-t border-(--color-border-subtle) space-y-2 text-xs text-left">
              <div className="flex items-center gap-2 text-(--color-text-secondary)">
                <MapPin size={14} className="text-(--color-text-muted)" />
                <span>Muayene Odası: <strong className="text-(--color-text-primary)">Oda 1</strong></span>
              </div>
              <div className="flex items-center gap-2 text-(--color-text-secondary)">
                <Mail size={14} className="text-(--color-text-muted)" />
                <span>{staff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-(--color-text-secondary)">
                <Phone size={14} className="text-(--color-text-muted)" />
                <span>{staff.phone || '—'}</span>
              </div>
            </div>
          </Card>

          {/* Right Column / Form */}
          <div className="md:col-span-2">
            <Card padding="md">
              <h3 className="text-sm font-bold text-(--color-text-primary) mb-4">
                {editing ? 'Klinik Bilgilerini Düzenle' : 'Klinik Bilgileri'}
              </h3>

              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1.5">Unvan</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 min-h-[44px] text-sm rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1.5">Branş / Uzmanlık</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3.5 py-2.5 min-h-[44px] text-sm rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1.5">Standart Muayene Ücreti (₺)</label>
                    <input
                      type="number"
                      step="50"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 min-h-[44px] text-sm font-mono tabular-nums rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 transition-all"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-(--color-border-subtle)">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} className="min-h-[44px] px-4 font-bold">
                      İptal
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={saving} className="min-h-[44px] px-6 font-bold shadow-xs">
                      {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-(--color-border-subtle)">
                    <div>
                      <span className="text-(--color-text-muted) font-medium">Muayene Ücreti:</span>
                      <p className="font-bold text-lg font-mono tabular-nums text-(--color-primary) mt-0.5">
                        {Number(doctor.initialExamFee).toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                    <div>
                      <span className="text-(--color-text-muted) font-medium">Klinik Branş:</span>
                      <p className="font-bold text-base text-(--color-text-primary) mt-0.5">
                        {doctor.branch}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-(--color-text-muted) font-medium block mb-1">Çalışma Planı:</span>
                    <p className="text-(--color-text-secondary) font-mono tabular-nums leading-relaxed">
                      Pazartesi - Cuma: 09:00 - 18:00 (Öğle Molası: 13:00 - 14:00)
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
