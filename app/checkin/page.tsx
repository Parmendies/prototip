'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveUpdates } from '@/app/_lib/useLiveUpdates';
import { getCheckinDetails, confirmCheckinAction } from './actions';
import { checkPatientPhone, loginWithPin, registerOrSetPin } from '@/app/(auth)/giris/actions';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Stethoscope,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckinPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getCheckinDetails>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Quick inline login states if user opened from camera without session
  const [loginStep, setLoginStep] = useState<'phone' | 'pin' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [isExistingPatient, setIsExistingPatient] = useState(false);

  // Danışma QR'ındaki imzalı kod (fiziksel varlık kanıtı)
  const [kioskToken, setKioskToken] = useState<string | null>(null);

  const loadDetails = useCallback(async (token?: string | null) => {
    try {
      const res = await getCheckinDetails(token);
      setData(res);
    } catch {
      setMessage({ type: 'error', text: 'Bilgiler alınamadı.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get('k');
    setKioskToken(k);
    loadDetails(k);
  }, [loadDetails]);

  // Banko tahsilatı / hekim çağırması bu ekrana anında yansır
  useLiveUpdates([data?.loggedIn ? `patient-${data.patientId}` : null], () => loadDetails(null), 20_000);

  async function handleCheckin() {
    if (!data || !data.loggedIn || !data.hasAppointment) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await confirmCheckinAction(data.appointment.id, kioskToken);
      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Girişiniz başarıyla onaylandı! Lütfen bankoya geçerek ödemenizi yapınız.',
        });
        await loadDetails(null);
      } else {
        setMessage({ type: 'error', text: res.error || 'Check-in yapılamadı.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Inline login handlers
  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoginLoading(true);
    try {
      const res = await checkPatientPhone(phone);
      if (res.status === 'found') {
        setIsExistingPatient(true);
        if (res.hasPin) setLoginStep('pin');
        else setLoginStep('register');
      } else {
        setIsExistingPatient(false);
        setLoginStep('register');
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await loginWithPin(phone, pin);
      if (res.success) {
        await loadDetails(null);
      } else {
        setMessage({ type: 'error', text: res.error || 'Hatalı PIN' });
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await registerOrSetPin({ phoneInput: phone, firstName, lastName, pin });
      if (res.success) {
        await loadDetails(null);
      } else {
        setMessage({ type: 'error', text: res.error || 'Kayıt başarısız.' });
      }
    } finally {
      setLoginLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-bg-base) flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 text-center">
          <div className="w-10 h-10 border-3 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-(--color-text-secondary)">Check-in bilgileri kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-bg-base) flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md mx-auto w-full pt-4">
        {/* Clinic Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-(--color-primary) text-white font-black text-xl shadow-(--shadow-glow-primary) mb-2">
            ✦
          </div>
          <h1 className="text-xl font-bold tracking-tight text-(--color-text-primary)">
            Denta<span className="text-(--color-primary)">Panel</span> Check-in
          </h1>
          <p className="text-xs text-(--color-text-secondary)">Klinik Giriş Noktası</p>
        </div>

        {message && (
          <div
            className={`mb-4 p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* CASE 1: USER IS NOT LOGGED IN YET (Show quick inline phone + PIN) */}
        {data && !data.loggedIn && (
          <Card padding="lg" className="shadow-(--shadow-md)">
            <div className="text-center mb-5">
              <h2 className="text-base font-bold text-(--color-text-primary)">
                Giriş Yapın & Check-in&apos;i Tamamlayın
              </h2>
              <p className="text-xs text-(--color-text-secondary) mt-1">
                Kameranızı QR koda tuttunuz. Randevunuzu eşleştirmek için lütfen numaranızı girin.
              </p>
            </div>

            {loginStep === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
                    Telefon Numaranız
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="05XX XXX XX XX"
                    autoFocus
                    required
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-base font-semibold text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft)" disabled={loginLoading}>
                  {loginLoading ? 'Aranıyor...' : 'Randevumu Bul'}
                </Button>
              </form>
            )}

            {loginStep === 'pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
                    4 Haneli PIN Kodunuz
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    autoFocus
                    required
                    className="w-full min-h-[52px] px-3.5 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-2xl text-center font-mono tracking-widest font-bold text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft)" disabled={loginLoading || pin.length !== 4}>
                  {loginLoading ? 'Kontrol Ediliyor...' : 'Doğrula & Check-in'}
                </Button>
              </form>
            )}

            {loginStep === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {!isExistingPatient && (
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Adınız"
                    required
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-sm font-medium text-(--color-text-primary)"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Soyadınız"
                    required
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-sm font-medium text-(--color-text-primary)"
                  />
                </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-(--color-text-secondary) mb-1">
                    4 Haneli PIN Belirleyin
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                    className="w-full min-h-[50px] px-3.5 py-2 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-center font-mono tracking-widest font-bold text-xl text-(--color-text-primary)"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft)" disabled={loginLoading}>
                  {loginLoading ? 'Kaydediliyor...' : 'Kaydet & Check-in Yap'}
                </Button>
              </form>
            )}
          </Card>
        )}

        {/* CASE 2: LOGGED IN BUT NO APPOINTMENT TODAY */}
        {data && data.loggedIn && !data.hasAppointment && (
          <Card padding="lg" className="text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-(--color-text-primary)">
              Bugün Randevunuz Bulunamadı
            </h2>
            <p className="text-xs text-(--color-text-secondary) mt-1.5 mb-5 max-w-xs mx-auto">
              Sayın <strong>{data.patientName}</strong>, bugün için onaylı bir randevu kaydınız görünmüyor.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/patient/book"
                className="w-full min-h-[44px] inline-flex items-center justify-center rounded-xl bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold"
              >
                Yeni Randevu Talep Et
              </Link>
              <Link
                href="/patient"
                className="w-full min-h-[44px] inline-flex items-center justify-center rounded-xl border border-(--color-border) text-(--color-text-primary) text-sm font-medium hover:border-(--color-primary)"
              >
                Hasta Portalıma Git
              </Link>
            </div>
          </Card>
        )}

        {/* CASE 3: LOGGED IN AND APPOINTMENT FOUND TODAY */}
        {data && data.loggedIn && data.hasAppointment && (
          <div className="space-y-4">
            {/* Early arrival notice */}
            {data.appointment.isEarlyArrival && data.appointment.status === 'confirmed' && (
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-300 text-xs text-sky-950 flex items-start gap-2.5 shadow-2xs">
                <Clock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Erken Geldiniz (Randevunuz {data.appointment.time}):</span>{' '}
                  Check-in yapıp ödemenizi bankodan tamamlayabilirsiniz. Sıranız geldiğinde hekiminiz sizi çağıracaktır.
                </div>
              </div>
            )}

            {/* Appointment Detail Card */}
            <Card padding="lg" className="border border-(--color-border-subtle) shadow-md bg-white">
              <div className="flex items-center justify-between pb-3.5 border-b border-(--color-border-subtle)">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-(--color-primary-muted) text-(--color-primary) flex items-center justify-center shadow-2xs">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-(--color-text-primary)">
                      {data.appointment.doctorName}
                    </h3>
                    <p className="text-xs text-(--color-text-secondary) mt-0.5 font-medium">
                      {data.appointment.doctorBranch}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-(--color-bg-elevated) text-(--color-text-primary) font-mono border border-(--color-border-subtle)">
                    {data.appointment.time}
                  </span>
                </div>
              </div>

              {/* Fee info */}
              <div className="my-4 p-4 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-(--color-text-secondary) block">
                    {data.appointment.feeTitle}
                  </span>
                  <span className="text-[11px] font-medium text-(--color-text-secondary)">Bankoda Tahsil Edilecek</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-(--color-text-primary) font-mono">
                    {data.appointment.expectedFee} ₺
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              {data.appointment.status === 'pending_approval' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-center">
                  <Clock className="w-7 h-7 text-amber-700 mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-amber-950">Randevunuz Henüz Onaylanmadı</div>
                  <p className="text-xs text-amber-900 mt-1 font-medium leading-relaxed">
                    Ön talebiniz bankoda onay bekliyor. Lütfen danışmaya uğrayınız; sekreterimiz randevunuzu onaylayıp
                    girişinizi yapacaktır.
                  </p>
                </div>
              )}

              {data.appointment.status === 'confirmed' && !data.atClinic && (
                <div className="p-4 rounded-xl bg-(--color-primary-muted) border border-(--color-primary)/30 text-center">
                  <Stethoscope className="w-7 h-7 text-(--color-primary) mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-(--color-text-primary)">Klinikteyseniz QR Kodu Okutun</div>
                  <p className="text-xs text-(--color-text-secondary) mt-1 font-medium leading-relaxed">
                    Check-in için danışmadaki ekranda/standdaki QR kodu telefonunuzun <strong>normal kamerasıyla</strong> okutunuz.
                    Telefonunuz yoksa banko girişinizi yapabilir.
                  </p>
                </div>
              )}

              {data.appointment.status === 'confirmed' && data.atClinic && (
                <Button
                  onClick={handleCheckin}
                  variant="primary"
                  size="lg"
                  className="w-full justify-center min-h-[56px] text-base font-bold shadow-(--shadow-primary-soft) active:scale-98 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Onaylanıyor...' : 'GELDİM — CHECK-IN YAP'}
                </Button>
              )}

              {data.appointment.status === 'checked_in_unpaid' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-center animate-pulse">
                  <CreditCard className="w-7 h-7 text-amber-700 mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-amber-950">Giriş Yapıldı — Ödeme Bekleniyor</div>
                  <p className="text-xs text-amber-900 mt-1 font-medium leading-relaxed">
                    Lütfen danışma bankosuna geçerek <strong>{data.appointment.expectedFee} ₺</strong> tutarını (POS veya Nakit) ödeyiniz.
                  </p>
                </div>
              )}

              {data.appointment.status === 'awaiting_chairside_payment' && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-center">
                  <CreditCard className="w-7 h-7 text-red-700 mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-red-950">Koltukta Yapılan İşlem — Ödeme Bekleniyor</div>
                  <p className="text-xs text-red-900 mt-1 font-medium leading-relaxed">
                    Çıkışta lütfen bankoya uğrayarak <strong>{data.appointment.expectedFee} ₺</strong> tutarını ödeyiniz.
                  </p>
                </div>
              )}

              {data.appointment.status === 'completed' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-emerald-950">Bugünkü Randevunuz Tamamlandı</div>
                  <p className="text-xs text-emerald-900 mt-1 font-medium leading-relaxed">
                    Geçmiş olsun! Tedavi planınızı ve reçetenizi hasta portalınızdan görebilirsiniz.
                  </p>
                </div>
              )}

              {data.appointment.status === 'waiting_room' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-emerald-950">Ödemeniz Alındı — Bekleme Odasında</div>
                  <p className="text-xs text-emerald-900 mt-1 font-medium leading-relaxed">
                    Hekiminiz bilgisayarından sizi çağıracaktır. Lütfen bekleme koltuklarına geçiniz.
                  </p>
                </div>
              )}

              {data.appointment.status === 'in_chair' && (
                <div className="p-4 rounded-xl bg-(--color-primary-muted) border border-(--color-primary)/30 text-center">
                  <Stethoscope className="w-7 h-7 text-(--color-primary) mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-(--color-primary-dark)">Muayenedesiniz</div>
                  <p className="text-xs text-(--color-text-secondary) mt-1 font-medium leading-relaxed">
                    İşleminiz hekiminizin odasında devam etmektedir.
                  </p>
                </div>
              )}
            </Card>

            <div className="text-center pt-2">
              <Link
                href="/patient"
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-primary) transition-colors"
              >
                <span>Hasta Portalıma ve Tedavi Planıma Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-(--color-text-muted)">
        DentaPanel &copy; 2026 • Akıllı Diş Kliniği Check-in Sistemi
      </footer>
    </div>
  );
}

