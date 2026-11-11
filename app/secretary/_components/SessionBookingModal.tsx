'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/app/_components/ui/Modal';
import { Button } from '@/app/_components/ui/Button';
import {
  bookDirectSessionAction,
  getDoctorSlotsForDeskAction,
  getDoctorsListAction,
  getPatientPlannedStepsAction,
} from '../desk/actions';
import { SlotPicker, type DoctorOption } from './SlotPicker';
import { clinicDateOffset } from '@/lib/time';

export interface SessionPatient {
  id: string;
  name: string;
  phone: string;
  defaultDoctorId?: string;
}

/** Hastanın tedavi planındaki bekleyen adım için bankodan doğrudan onaylı seans randevusu. */
export function SessionBookingModal({
  patient,
  onClose,
  onBooked,
}: {
  patient: SessionPatient | null;
  onClose: () => void;
  onBooked: (text: string) => void;
}) {
  const [steps, setSteps] = useState<Awaited<ReturnType<typeof getPatientPlannedStepsAction>>>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [stepId, setStepId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(() => clinicDateOffset(1));
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!patient) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTime('');
    setDate(clinicDateOffset(1));
    Promise.all([getPatientPlannedStepsAction(patient.id), getDoctorsListAction()])
      .then(([st, docs]) => {
        if (cancelled) return;
        setSteps(st);
        setDoctors(docs);
        setStepId(st[0]?.id ?? '');
        setDoctorId(patient.defaultDoctorId ?? docs[0]?.id ?? '');
      })
      .catch(() => !cancelled && setError('Bilgiler yüklenemedi.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [patient]);

  const duration = steps.find((s) => s.id === stepId)?.durationMin ?? 30;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patient || !stepId || !doctorId) return;
    if (!time) {
      setError('Lütfen uygun bir saat seçiniz.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await bookDirectSessionAction({
        patientId: patient.id,
        doctorId,
        treatmentStepId: stepId,
        appointmentDate: date,
        startTime: time,
      });
      if (res.success) {
        onBooked(`${patient.name} için seans randevusu onaylandı: ${date} saat ${time}.`);
        onClose();
      } else {
        setError(res.error);
        setTime('');
        setRefresh((n) => n + 1);
      }
    } catch {
      setError('Randevu atanamadı. Bağlantınızı kontrol ediniz.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={!!patient}
      onClose={onClose}
      title="Seans Randevusu Oluştur"
      subtitle={patient ? `${patient.name} • ${patient.phone}` : undefined}
      size="md"
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-(--color-text-secondary)">Tedavi planı yükleniyor...</div>
      ) : steps.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-xs text-(--color-text-primary) font-medium">
            Bu hastanın randevu bekleyen bir tedavi adımı yok.
          </p>
          <p className="text-[11px] text-(--color-text-secondary)">
            Hekim muayene ekranında &ldquo;Sonraki Seansa Planla&rdquo; adımı ekledikten sonra buradan seans verilebilir.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Kapat
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">Tedavi Adımı *</span>
            <select
              value={stepId}
              onChange={(e) => {
                setStepId(e.target.value);
                setTime('');
              }}
              className="w-full min-h-[44px] px-3.5 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) font-semibold"
              required
            >
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {Number(s.price).toLocaleString('tr-TR')} ₺ ({s.durationMin} dk)
                </option>
              ))}
            </select>
          </label>

          <SlotPicker
            doctors={doctors}
            doctorId={doctorId}
            onDoctorChange={setDoctorId}
            date={date}
            onDateChange={setDate}
            time={time}
            onTimeChange={setTime}
            durationLabel={`Seans süresi: ${duration} dk`}
            loadSlots={(docId, d) => getDoctorSlotsForDeskAction(docId, d, duration)}
            refreshKey={refresh * 1000 + duration}
          />

          {error && (
            <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium">
              {error}
            </p>
          )}

          <p className="p-3 rounded-xl bg-(--color-primary-muted) text-xs text-(--color-text-primary) leading-relaxed">
            Randevu doğrudan <strong>onaylı</strong> olarak takvime eklenir; seans ücreti hasta geldiğinde bankoda alınır.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Randevuyu Onayla
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
