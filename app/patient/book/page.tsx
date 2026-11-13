'use client';

import { useState, useEffect } from 'react';
import { clinicDateOffset } from '@/lib/time';
import { isWorkingDay, MAX_BOOKING_DAYS_AHEAD, type Slot, type WorkingSchedule } from '@/lib/slots';
import { getActiveDoctors, createAppointmentPreRequest, getAvailableSlots, getStepBookingInfo, recommendDoctorForComplaint } from './actions';
import type { TriageResult } from '@/lib/ai/triage';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import {
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const QUICK_TAGS = [
  'Diş Ağrısı / Sızlama',
  'Kırık / Düşen Dolgu',
  'Diş Eti Kanaması / Şişlik',
  '20 Yaş Dişi Ağrısı',
  'Diş Taşı Temizliği',
  'Genel Kontrol & Muayene',
  'İmplant / Protez Danışma',
  'Estetik / Beyazlatma',
];


export default function BookAppointmentPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [doctors, setDoctors] = useState<Awaited<ReturnType<typeof getActiveDoctors>>>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [complaint, setComplaint] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsWorkingDay, setSlotsWorkingDay] = useState(true);
  // Tedavi planındaki bir seans için talep (/patient/book?step=<id>)
  const [sessionStep, setSessionStep] = useState<Awaited<ReturnType<typeof getStepBookingInfo>>>(null);
  // Yapay zekâ hekim önerisi: hangi şikayet metni için üretildiğiyle birlikte tutulur
  const [triage, setTriage] = useState<{ complaint: string; result: TriageResult | null } | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const stepParam = new URLSearchParams(window.location.search).get('step');
        const [docs, stepInfo] = await Promise.all([
          getActiveDoctors(),
          stepParam ? getStepBookingInfo(stepParam) : Promise.resolve(null),
        ]);
        setDoctors(docs);

        let doctor = docs[0];
        if (stepParam) {
          const planDoctor = stepInfo && docs.find((d) => d.id === stepInfo.doctorId);
          if (stepInfo && planDoctor) {
            setSessionStep(stepInfo);
            doctor = planDoctor;
            setStep(3); // hekim ve işlem belli: doğrudan tarih/saat seçimine
          } else {
            setError('Bu seans için zaten randevu talebiniz var veya seans artık randevuya uygun değil. Yeni bir muayene talebi oluşturabilirsiniz.');
          }
        }
        if (doctor) setSelectedDoctorId(doctor.id);

        // Varsayılan tarih: hekimin bugünden sonraki ilk çalışma günü
        const firstSchedule = doctor?.workingSchedule as WorkingSchedule | null | undefined;
        setSelectedDate(nextWorkingDays(firstSchedule, 1)[0] ?? clinicDateOffset(1));
      } catch {
        setError('Hekim listesi alınamadı.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const selectedSchedule = selectedDoctor?.workingSchedule as WorkingSchedule | null | undefined;
  const dateOptions = nextWorkingDays(selectedSchedule, 14);

  // Hekim değişince seçili tarih o hekimin çalışma günü değilse ilk uygun güne kaydır
  useEffect(() => {
    if (!selectedDoctorId) return;
    const schedule = doctors.find((d) => d.id === selectedDoctorId)?.workingSchedule as WorkingSchedule | null | undefined;
    if (selectedDate && !isWorkingDay(schedule, selectedDate)) {
      const first = nextWorkingDays(schedule, 1)[0];
      if (first) setSelectedDate(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorId]);

  // Seçilen hekim + tarih için gerçek boş saatleri sunucudan çek
  useEffect(() => {
    if (step !== 3 || !selectedDoctorId || !selectedDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot(null);
    getAvailableSlots(selectedDoctorId, selectedDate, sessionStep?.id)
      .then((res) => {
        if (cancelled) return;
        setSlots(res.slots);
        setSlotsWorkingDay(res.isWorkingDay);
      })
      .catch(() => {
        if (!cancelled) setError('Uygun saatler alınamadı.');
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, selectedDoctorId, selectedDate, sessionStep]);

  const complaintText = complaint.trim();
  const canTriage = complaintText.length >= 5;
  // Öneri yalnızca üretildiği şikayet metni değişmediyse geçerlidir
  const triageIsCurrent = triage !== null && triage.complaint === complaintText;
  const activeRecommendation = triageIsCurrent ? triage.result : null;
  const triageUnavailable = triageIsCurrent && triage.result === null;
  const recommendedDoctor = activeRecommendation?.doctorId
    ? doctors.find((d) => d.id === activeRecommendation.doctorId)
    : undefined;
  const orderedDoctors = recommendedDoctor
    ? [recommendedDoctor, ...doctors.filter((d) => d.id !== recommendedDoctor.id)]
    : doctors;

  async function handleComplaintContinue() {
    setError(null);
    if (!canTriage || triageIsCurrent) {
      setStep(2);
      return;
    }
    setIsTriaging(true);
    let result: TriageResult | null = null;
    try {
      result = await recommendDoctorForComplaint(complaintText);
    } catch {
      result = null; // öneri alınamazsa akış önerisiz devam eder
    }
    setTriage({ complaint: complaintText, result });
    if (result?.doctorId && doctors.some((d) => d.id === result.doctorId)) {
      setSelectedDoctorId(result.doctorId);
    }
    setIsTriaging(false);
    setStep(2);
  }

  async function handleSubmit() {
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      setError('Lütfen tüm seçimleri tamamlayınız.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createAppointmentPreRequest({
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        complaintText: complaint || (sessionStep ? '' : 'Genel Muayene'),
        treatmentStepId: sessionStep?.id,
      });

      if (res.success) {
        setIsDone(true);
      } else {
        setError(res.error || 'Ön talep oluşturulamadı.');
        // Saat bu arada dolmuş olabilir: listeyi tazele
        const fresh = await getAvailableSlots(selectedDoctorId, selectedDate, sessionStep?.id);
        setSlots(fresh.slots);
        setSelectedSlot(null);
      }
    } catch {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-bg-base) flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-(--color-text-secondary)">Hekim takvimi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="min-h-screen bg-(--color-bg-base) flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md w-full text-center shadow-(--shadow-lg)">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-(--color-text-primary)">
            Randevu Ön Talebiniz Alındı!
          </h1>
          <p className="text-xs text-(--color-text-secondary) mt-2 mb-6 leading-relaxed">
            Talebiniz bankodaki sekreterimize iletildi. Randevu saatinizi kesinleştirmek için sekreterimiz sizi telefonla arayacaktır.
          </p>

          <div className="p-4 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Hekim:</span>
              <span className="font-semibold text-(--color-text-primary)">
                {selectedDoctor?.title} {selectedDoctor?.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-(--color-text-muted)">Tarih & Saat:</span>
              <span className="font-semibold text-(--color-text-primary)">
                {selectedDate} — {selectedSlot}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-(--color-border-subtle)">
              <span className="text-(--color-text-muted)">{sessionStep ? sessionStep.title : 'Ön Muayene Ücreti'}:</span>
              <span className="font-bold text-(--color-primary)">
                {(sessionStep ? sessionStep.price : Number(selectedDoctor?.initialExamFee)).toLocaleString('tr-TR')} ₺ (Bankoda Ödenecek)
              </span>
            </div>
          </div>

          <Link
            href="/patient"
            className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-base font-semibold"
          >
            Randevularıma & Portala Dön
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-bg-base) pb-12">
      {/* Header */}
      <header className="bg-white border-b border-(--color-border-subtle) px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/patient" className="text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-primary) flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Portala Dön
          </Link>
          <span className="text-sm font-bold text-(--color-text-primary)">
            {sessionStep ? 'Tedavi Seansı Talebi' : `Randevu Ön Talebi (Adım ${step}/3)`}
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ŞİKAYET GİRİŞİ */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-(--color-text-primary)">
                1. Şikayetinizi Anlatın
              </h2>
              <p className="text-xs text-(--color-text-secondary) mt-0.5">
                Yazdıklarınıza göre size en uygun bölümü ve hekimi önerelim. Hangi hekime gideceğinizi bilmenize gerek yok.
              </p>
            </div>

            {/* Quick tags */}
            <div>
              <label className="block text-xs font-bold text-(--color-text-secondary) mb-2">
                Hızlı Seçim Etiketleri
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    disabled={isTriaging}
                    onClick={() => {
                      if (complaint.includes(tag)) return;
                      setComplaint((prev) => (prev ? `${prev}, ${tag}` : tag));
                    }}
                    className="min-h-[38px] text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white border border-(--color-border-subtle) hover:border-(--color-primary) hover:text-(--color-primary) transition-all text-(--color-text-secondary) cursor-pointer active:scale-95 shadow-2xs"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="complaint" className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
                Şikayet Detayı
              </label>
              <textarea
                id="complaint"
                rows={4}
                maxLength={1000}
                value={complaint}
                disabled={isTriaging}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Örn: Sol alt azı dişimde 2 gündür soğuk su içerken şiddetli sızlama oluyor..."
                className="w-full p-3.5 rounded-xl bg-white border border-(--color-border-subtle) text-sm font-medium text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:ring-2 focus:ring-(--color-primary) focus:outline-none resize-none disabled:opacity-60"
              />
              <p className="text-[11px] text-(--color-text-muted) mt-1.5 leading-relaxed">
                Öneri için yalnızca bu metin yapay zekâya iletilir; adınız ve telefon numaranız paylaşılmaz. Lütfen metne kimlik bilgisi yazmayınız.
              </p>
            </div>

            <Button
              onClick={handleComplaintContinue}
              variant="primary"
              size="lg"
              className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft)"
              loading={isTriaging}
              icon={canTriage ? <Sparkles className="w-4 h-4" /> : undefined}
              iconRight={canTriage ? undefined : <ArrowRight className="w-4 h-4" />}
            >
              {isTriaging
                ? 'Size uygun hekim belirleniyor...'
                : canTriage
                  ? 'Bana Uygun Hekimi Öner'
                  : 'Devam Et: Hekim Seçimi'}
            </Button>
            {canTriage && !isTriaging && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full min-h-[44px] text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-primary) cursor-pointer"
              >
                Hekimimi kendim seçmek istiyorum
              </button>
            )}
          </div>
        )}

        {/* STEP 2: HEKİM SEÇİMİ (yapay zekâ önerisiyle) */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-(--color-text-primary)">
                2. Hekiminizi Seçin
              </h2>
              <p className="text-xs text-(--color-text-secondary) mt-0.5">
                Ön muayene ücreti hekimin uzmanlığına göre değişmekte olup bankoda tahsil edilir.
              </p>
            </div>

            {activeRecommendation?.urgency === 'urgent' && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold">Şikayetiniz acil olabilir.</p>
                  <p>
                    Randevu onayını beklemeden kliniğimizi telefonla arayınız. Nefes alma veya yutma güçlüğü, durmayan kanama varsa 112&apos;yi arayınız.
                  </p>
                </div>
              </div>
            )}

            {activeRecommendation ? (
              <div className="p-4 rounded-2xl bg-(--color-primary-muted)/50 border border-(--color-primary)/30">
                <div className="flex items-center gap-2 text-(--color-primary)">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">
                    {recommendedDoctor
                      ? `Önerilen bölüm: ${activeRecommendation.department || recommendedDoctor.branch}`
                      : 'Şikayetiniz hakkında'}
                  </span>
                </div>
                <p className="text-sm text-(--color-text-primary) mt-1.5 leading-relaxed">
                  {activeRecommendation.reason}
                </p>
                {activeRecommendation.urgency === 'soon' && (
                  <p className="text-xs font-semibold text-amber-800 mt-1.5">
                    En yakın uygun randevu saatini seçmenizi öneririz.
                  </p>
                )}
                <p className="text-[11px] text-(--color-text-secondary) mt-2 leading-relaxed">
                  Bu bir yönlendirme önerisidir, teşhis değildir. Dilerseniz başka bir hekim seçebilirsiniz.
                </p>
              </div>
            ) : (
              triageUnavailable && (
                <div className="p-3 rounded-xl bg-white border border-dashed border-(--color-border-subtle) text-xs text-(--color-text-secondary)">
                  Şu an otomatik öneri sunamıyoruz. Hekiminizi aşağıdaki listeden seçebilirsiniz; emin değilseniz sekreterimiz sizi doğru hekime yönlendirecektir.
                </div>
              )
            )}

            <div className="grid grid-cols-1 gap-3">
              {orderedDoctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id;
                const isRecommended = recommendedDoctor?.id === doc.id;
                return (
                  <button
                    type="button"
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-(--color-primary-muted)/50 border-2 border-(--color-primary) shadow-sm'
                        : 'bg-white border-(--color-border-subtle) hover:border-(--color-border)'
                    }`}
                  >
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full bg-(--color-primary) text-white text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" /> Size Önerilen
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected ? 'bg-(--color-primary) text-white shadow-xs' : 'bg-(--color-bg-elevated) text-(--color-primary)'
                        }`}>
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-(--color-text-primary) truncate">
                            {doc.title} {doc.fullName}
                          </h3>
                          <p className="text-xs text-(--color-text-secondary) mt-0.5 font-medium">
                            {doc.branch}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-semibold text-(--color-text-secondary) block">Muayene Ücreti</span>
                        <span className="text-sm font-extrabold text-(--color-primary) font-mono">
                          {Number(doc.initialExamFee).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={() => setStep(1)} variant="outline" size="lg" icon={<ArrowLeft className="w-4 h-4" />} className="w-1/3 justify-center min-h-[48px] text-sm font-semibold">
                Geri
              </Button>
              <Button
                onClick={() => setStep(3)}
                variant="primary"
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="w-2/3 justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft)"
                disabled={!selectedDoctorId}
              >
                Tarih & Saat Seç
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: TARİH & SLOT SEÇİMİ VE ONAY */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-(--color-text-primary)">
                {sessionStep ? 'Seansınız İçin Tarih ve Saat Seçin' : '3. Tarih ve Randevu Saati Seçimi'}
              </h2>
              <p className="text-xs text-(--color-text-secondary) mt-0.5">
                Seçtiğiniz saat ön talep olarak sekretere iletilecek ve teyit edilecektir.
              </p>
            </div>

            {/* Tarih seçimi: yalnızca hekimin çalışma günleri */}
            <div>
              <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
                Randevu Tarihi
              </label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                {dateOptions.map((d) => {
                  const isSelected = selectedDate === d;
                  const { weekday, day, month } = formatDateChip(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      aria-pressed={isSelected}
                      className={`shrink-0 min-w-[64px] min-h-[64px] px-2 py-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-(--color-primary) text-white border-(--color-primary) shadow-(--shadow-primary-soft)'
                          : 'bg-white text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                      }`}
                    >
                      <span className={`block text-[11px] font-semibold ${isSelected ? 'text-white/85' : 'text-(--color-text-secondary)'}`}>{weekday}</span>
                      <span className="block text-lg font-bold tabular-nums leading-tight">{day}</span>
                      <span className={`block text-[11px] ${isSelected ? 'text-white/85' : 'text-(--color-text-muted)'}`}>{month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots Grid */}
            <div>
              <label className="block text-xs font-bold text-(--color-text-secondary) mb-2">
                Uygun Saat Dilimi Seçiniz
              </label>
              {slotsLoading ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" aria-busy="true">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="min-h-[44px] rounded-xl bg-(--color-bg-elevated) animate-pulse" />
                  ))}
                </div>
              ) : !slotsWorkingDay || slots.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-dashed border-(--color-border-subtle) text-center text-xs text-(--color-text-secondary)">
                  Bu gün için randevu saati bulunmuyor. Lütfen başka bir gün seçiniz.
                </div>
              ) : slots.every((sl) => !sl.available) ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-900 font-medium">
                  Bu günün tüm saatleri dolu. Lütfen başka bir gün seçiniz.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          aria-pressed={isSelected}
                          aria-label={slot.available ? slot.time : `${slot.time} — ${slot.reason === 'busy' ? 'dolu' : 'uygun değil'}`}
                          className={`min-h-[44px] py-2.5 rounded-xl text-xs font-mono font-bold transition-all border select-none ${
                            !slot.available
                              ? 'bg-(--color-bg-elevated) text-(--color-text-muted) border-transparent line-through cursor-not-allowed'
                              : isSelected
                                ? 'bg-(--color-primary) text-white border-(--color-primary) shadow-(--shadow-primary-soft) cursor-pointer'
                                : 'bg-white text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary) cursor-pointer'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-(--color-text-muted) mt-2">Üstü çizili saatler dolu veya uygun değil.</p>
                </>
              )}
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-white border border-(--color-border-subtle) shadow-xs space-y-2 text-xs">
              <div className="font-bold text-(--color-text-primary) text-sm pb-2 border-b border-(--color-border-subtle)">
                Randevu Özeti
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-secondary)">Hekim:</span>
                <span className="font-semibold text-(--color-text-primary)">
                  {selectedDoctor?.title} {selectedDoctor?.fullName} ({selectedDoctor?.branch})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--color-text-secondary)">Tarih & Saat:</span>
                <span className="font-semibold text-(--color-text-primary) font-mono">
                  {selectedDate} — {selectedSlot || 'Seçilmedi'}
                </span>
              </div>
              {sessionStep ? (
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">İşlem:</span>
                  <span className="text-(--color-text-primary) font-semibold text-right">
                    {sessionStep.title}
                    {sessionStep.fdiNumber ? ` (#${sessionStep.fdiNumber})` : ''} • {sessionStep.durationMin} dk
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-(--color-text-secondary)">Şikayet:</span>
                  <span className="text-(--color-text-primary) italic max-w-xs truncate">
                    {complaint || 'Belirtilmedi'}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-(--color-border-subtle) font-bold">
                <span className="text-(--color-text-secondary)">{sessionStep ? 'Seans Ücreti:' : 'Ön Muayene Ücreti:'}</span>
                <span className="text-(--color-primary) text-sm font-mono font-extrabold">
                  {(sessionStep ? sessionStep.price : Number(selectedDoctor?.initialExamFee)).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {sessionStep ? (
                <Link
                  href="/patient"
                  className="w-1/3 min-h-[48px] inline-flex items-center justify-center rounded-xl border border-(--color-border) text-(--color-text-primary) text-sm font-semibold"
                >
                  Vazgeç
                </Link>
              ) : (
                <Button onClick={() => setStep(2)} variant="outline" size="lg" icon={<ArrowLeft className="w-4 h-4" />} className="w-1/3 justify-center min-h-[48px] text-sm font-semibold">
                  Geri
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                className="w-2/3 justify-center min-h-[48px] font-bold shadow-(--shadow-primary-soft)"
                disabled={isSubmitting || !selectedSlot}
              >
                {isSubmitting ? 'Gönderiliyor...' : sessionStep ? 'Seans Talebini Gönder' : 'Randevu Ön Talebini Gönder'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function nextWorkingDays(schedule: WorkingSchedule | null | undefined, count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i <= MAX_BOOKING_DAYS_AHEAD && result.length < count; i++) {
    const d = clinicDateOffset(i);
    if (isWorkingDay(schedule, d)) result.push(d);
  }
  return result;
}

function formatDateChip(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return {
    weekday: dt.toLocaleDateString('tr-TR', { weekday: 'short', timeZone: 'UTC' }),
    day: String(d),
    month: dt.toLocaleDateString('tr-TR', { month: 'short', timeZone: 'UTC' }),
  };
}
