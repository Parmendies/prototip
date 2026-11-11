'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/app/_components/ui/Card';
import { Badge } from '@/app/_components/ui/Badge';
import { Button } from '@/app/_components/ui/Button';
import { callPatientInChair, completeAppointmentDirectly } from './actions';
import { ConfirmDialog } from '@/app/_components/ui/ConfirmDialog';
import { useLiveUpdates } from '@/app/_lib/useLiveUpdates';
import {
  Volume2,
  VolumeX,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Phone,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  LogOut,
  Stethoscope,
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  tcIdentityNo?: string | null;
  birthDate?: string | null;
  medicalAlertNote?: string | null;
}

interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  visitType: string;
  status: string;
  isEarlyArrival: boolean;
  checkedInAt: Date | string | null;
  complaintText: string | null;
  patient: Patient;
}

interface DoctorProfileData {
  id: string;
  title: string;
  specialty: string;
  roomNumber: string | null;
  examinationFee: string;
  doctorName: string;
}

export default function DoctorWorkspaceClient({
  doctor,
  inChairAppointment,
  waitingRoomAppointments,
  completedAppointments,
  upcomingAppointments,
}: {
  doctor: DoctorProfileData;
  inChairAppointment: Appointment | null;
  waitingRoomAppointments: Appointment[];
  completedAppointments: Appointment[];
  upcomingAppointments: Appointment[];
}) {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCalling, setIsCalling] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastCount, setLastCount] = useState(waitingRoomAppointments.length);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Update last refreshed time on client
  useEffect(() => {
    setLastRefreshed(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [waitingRoomAppointments, inChairAppointment]);

  // Web Audio Clinic Chime Synthesizer
  const playClinicChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.7);

      // Note 2: A5 (880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.22);
      gain2.gain.setValueAtTime(0.3, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn('Audio chime could not be synthesized:', e);
    }
  };

  // Play sound when new patient arrives in waiting room
  useEffect(() => {
    if (waitingRoomAppointments.length > lastCount) {
      if (soundEnabled) {
        playClinicChime();
      }
    }
    setLastCount(waitingRoomAppointments.length);
  }, [waitingRoomAppointments.length, lastCount, soundEnabled]);

  // Banko tahsilatı onayladığı anda bekleme odası güncellenir (Supabase Realtime) + 30 sn yedek yenileme
  useLiveUpdates([`doctor-${doctor.id}`], () => router.refresh());
  const [confirmCompleteId, setConfirmCompleteId] = useState<string | null>(null);

  const handleCallIn = async (appointmentId: string) => {
    try {
      setIsCalling(appointmentId);
      setActionError(null);
      const res = await callPatientInChair(appointmentId);
      if (res && !res.success) {
        setActionError(res.error);
        setIsCalling(null);
        router.refresh();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Hasta içeri çağrılırken bir hata oluştu.');
      setIsCalling(null);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    setConfirmCompleteId(null);
    try {
      setIsCompleting(true);
      setActionError(null);
      const res = await completeAppointmentDirectly(appointmentId);
      if (!res.success) {
        setActionError(res.error);
      } else if (res.outcome === 'locked') {
        setActionError('Ödenmemiş koltuk işlemi var: hasta bankoya yönlendirildi, tahsilat sonrası randevu kapanacak.');
      }
      router.refresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Muayene tamamlanamadı.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-(--color-bg-base)">
      {/* Top Header Bar */}
      <header className="px-6 py-4 bg-(--color-bg-surface) border-b border-(--color-border-subtle) flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center font-bold text-lg border border-(--color-primary)/20">
            🦷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-(--color-text-primary)">
                {doctor.title} {doctor.doctorName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Oda: {doctor.roomNumber || '1'}
              </span>
            </div>
            <p className="text-xs text-(--color-text-muted)">
              {doctor.specialty} • Muayene Ücreti: {Number(doctor.examinationFee).toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>

        {/* Chime & Refresh Controls */}
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-(--color-text-muted) mr-2 hidden sm:block">
            Son güncelleme: <span className="font-mono">{lastRefreshed}</span>
          </div>

          <Button
            variant={soundEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playClinicChime();
            }}
            icon={soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          >
            {soundEnabled ? 'Sesli Zil Aktif' : 'Zil Kapalı'}
          </Button>

          {soundEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={playClinicChime}
              className="text-xs text-(--color-primary) hidden md:inline-flex"
            >
              Test Et
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.refresh()}
            icon={<RefreshCw size={14} />}
            aria-label="Yenile"
          />
        </div>
      </header>

      {/* Action Error Message */}
      {actionError && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ============================================================== */}
        {/* SECTION 1: KOLTUKTAKİ HASTA (ACTIVE PATIENT IN CHAIR) */}
        {/* ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-(--color-text-primary) uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Koltuktaki Hasta
            </h2>
            {inChairAppointment && (
              <span className="text-xs text-(--color-text-muted)">
                Giriş: {inChairAppointment.startTime.slice(0, 5)}
              </span>
            )}
          </div>

          {inChairAppointment ? (
            <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-2 border-emerald-500/30 shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                      Şu An Koltukta
                    </span>
                    <span className="text-lg font-bold text-(--color-text-primary)">
                      {inChairAppointment.patient.firstName} {inChairAppointment.patient.lastName}
                    </span>
                    {inChairAppointment.isEarlyArrival && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                        ⏰ Erken Geldi (Randevu: {inChairAppointment.startTime.slice(0, 5)})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-(--color-text-secondary)">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Phone size={13} className="text-(--color-text-muted)" />
                      {inChairAppointment.patient.phone}
                    </span>
                    {inChairAppointment.patient.birthDate && (
                      <span>
                        Yaş: {new Date().getFullYear() - new Date(inChairAppointment.patient.birthDate).getFullYear()}
                      </span>
                    )}
                    {inChairAppointment.patient.medicalAlertNote && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-medium">
                        Uyarı / Alerji: {inChairAppointment.patient.medicalAlertNote}
                      </span>
                    )}
                  </div>

                  {inChairAppointment.complaintText && (
                    <div className="mt-2 text-xs text-(--color-text-secondary) bg-(--color-bg-surface)/80 p-2.5 rounded-xl border border-(--color-border-subtle)">
                      <strong className="text-(--color-text-primary)">Hasta Şikayeti:</strong> &ldquo;{inChairAppointment.complaintText}&rdquo;
                    </div>
                  )}

                  {inChairAppointment.status === 'awaiting_chairside_payment' && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle size={16} className="text-amber-600 shrink-0" />
                      <div>
                        <strong>KOLTUKTA EK İŞLEM UYGULANDI:</strong> Banko çıkış tahsilatını onaylamadan bu randevu sonlandırılamaz.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  <Link
                    href={`/doctor/examination/${inChairAppointment.id}`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-(--color-primary) hover:bg-(--color-primary-dark) text-white font-bold text-sm shadow-(--shadow-primary-soft) active:scale-98 transition-all cursor-pointer"
                  >
                    <Stethoscope size={16} />
                    <span>Muayene Ekranı & FDI Çizelgesi</span>
                  </Link>

                  {inChairAppointment.status !== 'awaiting_chairside_payment' && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setConfirmCompleteId(inChairAppointment.id)}
                      disabled={isCompleting}
                      className="min-h-[44px] px-4 text-xs font-semibold"
                    >
                      {isCompleting ? 'Tamamlanıyor...' : 'Muayeneyi Kapat'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Card padding="md" className="border-dashed text-center py-8">
              <div className="w-12 h-12 rounded-full bg-(--color-bg-elevated) text-(--color-text-muted) flex items-center justify-center mx-auto mb-2 text-xl">
                🪑
              </div>
              <p className="text-sm font-semibold text-(--color-text-primary)">Şu an koltukta hasta bulunmuyor</p>
              <p className="text-xs text-(--color-text-muted) mt-1 max-w-sm mx-auto">
                Bekleme odasından sıradaki hastayı içeri çağırarak muayeneyi ve diş çizelgesini başlatabilirsiniz.
              </p>
            </Card>
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: BEKLEME ODASI (CANLI SIRALAMA) */}
        {/* ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-(--color-text-primary) uppercase tracking-wider">
                Bekleme Odası (Canlı)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-(--color-primary) text-white">
                {waitingRoomAppointments.length} Bekleyen
              </span>
            </div>
            <span className="text-xs text-(--color-text-muted)">
              Ücreti tahsil edilmiş ve hazır hastalar
            </span>
          </div>

          {waitingRoomAppointments.length === 0 ? (
            <Card padding="md" className="text-center py-8">
              <UserCheck size={28} className="mx-auto text-(--color-text-muted) mb-2 opacity-50" />
              <p className="text-sm font-semibold text-(--color-text-secondary)">Bekleme odasında hasta yok</p>
              <p className="text-xs text-(--color-text-muted) mt-0.5">
                Hastalar QR check-in yapıp bankoda muayene ücretini ödediğinde otomatik olarak buraya düşer ve sesli zil çalar.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitingRoomAppointments.map((apt, index) => {
                const checkInDate = apt.checkedInAt ? new Date(apt.checkedInAt) : null;
                const waitMinutes = checkInDate
                  ? Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 60000))
                  : null;

                return (
                  <Card
                    key={apt.id}
                    padding="md"
                    className="border-l-4 border-l-(--color-primary) flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-(--color-primary)/10 text-(--color-primary) text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <h3 className="text-base font-bold text-(--color-text-primary)">
                              {apt.patient.firstName} {apt.patient.lastName}
                            </h3>
                          </div>
                          <p className="text-xs text-(--color-text-muted) font-mono mt-0.5 ml-7">
                            {apt.patient.phone}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                            Ödeme Alındı
                          </span>
                          {apt.isEarlyArrival && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                              ⏰ Erken Geldi ({apt.startTime.slice(0, 5)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-(--color-border-subtle) flex items-center justify-between text-xs text-(--color-text-muted)">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-(--color-primary)" />
                          <span>Randevu: <strong className="text-(--color-text-primary)">{apt.startTime.slice(0, 5)}</strong></span>
                        </div>
                        {waitMinutes !== null && (
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            Bekleme: {waitMinutes} dk
                          </span>
                        )}
                      </div>

                      {apt.complaintText && (
                        <div className="mt-2 text-xs bg-(--color-bg-elevated) p-2.5 rounded-xl text-(--color-text-secondary)">
                          <span className="font-semibold text-(--color-text-primary)">Şikayet:</span> {apt.complaintText}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-(--color-border-subtle)">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full justify-center min-h-[44px] text-xs sm:text-sm font-bold py-2.5 shadow-(--shadow-primary-soft)"
                        onClick={() => handleCallIn(apt.id)}
                        disabled={isCalling === apt.id || inChairAppointment !== null}
                        icon={<Stethoscope size={16} />}
                      >
                        {isCalling === apt.id
                          ? 'İçeri Alınıyor...'
                          : inChairAppointment
                          ? 'Önce Koltuktaki Hastayı Kapatın'
                          : '🚪 Hastayı İçeri Çağır'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: GÜNÜN DİĞER RANDEVULARI */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Bekleyen & Henüz Gelmeyenler */}
          <Card padding="md">
            <h3 className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Calendar size={14} />
              Günün Gelecek Randevuları ({upcomingAppointments.length})
            </h3>
            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-(--color-text-muted) py-4 text-center">Gelecek başka randevu yok.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-(--color-bg-elevated) text-xs"
                  >
                    <div>
                      <p className="font-bold text-(--color-text-primary)">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </p>
                      <p className="text-[11px] text-(--color-text-muted)">{apt.patient.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-(--color-primary)">
                        {apt.startTime.slice(0, 5)}
                      </span>
                      <p className="text-[10px] text-(--color-text-muted)">
                        {apt.status === 'checked_in_unpaid' ? 'Bankoda Ödüyor' : 'Bekleniyor'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Bugün Tamamlanan Randevular */}
          <Card padding="md">
            <h3 className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Bugün Tamamlananlar ({completedAppointments.length})
            </h3>
            {completedAppointments.length === 0 ? (
              <p className="text-xs text-(--color-text-muted) py-4 text-center">Henüz tamamlanan muayene yok.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {completedAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-(--color-bg-elevated) text-xs"
                  >
                    <div>
                      <p className="font-bold text-(--color-text-primary)">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </p>
                      <p className="text-[11px] text-(--color-text-muted)">
                        {apt.visitType === 'treatment_session' ? 'Tedavi Seansı' : 'İlk Muayene'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {apt.startTime.slice(0, 5)}
                      </span>
                      <Link
                        href={`/doctor/examination/${apt.id}`}
                        className="p-1 text-(--color-primary) hover:underline text-[11px]"
                      >
                        İncele
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!confirmCompleteId}
        title="Muayeneyi Kapat"
        message="Muayene tamamlanıp hasta çıkışa yönlendirilecek. Ödenmemiş koltuk işlemi varsa hasta bankoya tahsilata düşer."
        confirmLabel="Muayeneyi Kapat"
        onConfirm={() => (confirmCompleteId ? handleComplete(confirmCompleteId) : undefined)}
        onClose={() => setConfirmCompleteId(null)}
      />
    </div>
  );
}
