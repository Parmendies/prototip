'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkPatientPhone, loginWithPin, registerOrSetPin } from './actions';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Phone, Lock, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

function PatientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Yalnızca site içi göreli adreslere dönülür (açık yönlendirme koruması)
  const rawReturnUrl = searchParams.get('returnUrl');
  const returnUrl =
    rawReturnUrl && rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//') ? rawReturnUrl : '/patient';

  const [step, setStep] = useState<'phone' | 'pin' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tc, setTc] = useState('');
  const [greetingName, setGreetingName] = useState('');
  // Kayıtlı ama PIN'i olmayan (bankoda açılmış / PIN'i sıfırlanmış) hasta: ad-soyad sorulmaz
  const [isExistingPatient, setIsExistingPatient] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    setPhone(val);
    setError(null);
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Lütfen geçerli bir telefon numarası giriniz (örn: 0555 111 22 33).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await checkPatientPhone(phone);
      if (res.status === 'found') {
        setGreetingName(res.displayName);
        setIsExistingPatient(true);
        if (res.hasPin) {
          setStep('pin');
        } else {
          setStep('register');
        }
      } else {
        setIsExistingPatient(false);
        setStep('register');
      }
    } catch {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN 4 haneli olmalıdır.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await loginWithPin(phone, pin);
      if (res.success) {
        router.push(returnUrl);
      } else {
        setError(res.error || 'Hatalı PIN girdiniz.');
      }
    } catch {
      setError('Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isExistingPatient && (!firstName.trim() || !lastName.trim())) {
      setError('Lütfen ad ve soyadınızı giriniz.');
      return;
    }
    if (pin.length !== 4) {
      setError('Lütfen 4 haneli bir PIN kodu belirleyiniz.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await registerOrSetPin({
        phoneInput: phone,
        firstName,
        lastName,
        pin,
        tcIdentityNo: tc,
      });

      if (res.success) {
        router.push(returnUrl);
      } else {
        setError(res.error || 'Kayıt işlemi başarısız oldu.');
      }
    } catch {
      setError('Kayıt yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card padding="lg" className="shadow-lg border border-(--color-border-subtle) bg-white">
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ADIM 1: TELEFON GİRİŞİ */}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) mb-2">
              Cep Telefonu Numaranız
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-text-secondary)">
                <Phone className="w-5 h-5 text-(--color-primary)" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="05XX XXX XX XX"
                autoFocus
                required
                className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-base font-semibold text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <p className="text-[11px] font-medium text-(--color-text-secondary) mt-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-(--color-primary) shrink-0" />
              Bilgileriniz KVKK standartlarında güvenle korunmaktadır.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft)"
            disabled={isLoading}
          >
            {isLoading ? 'Kontrol ediliyor...' : 'Devam Et'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      )}

      {/* ADIM 2A: PIN GİRİŞİ (MEVCUT HASTA) */}
      {step === 'pin' && (
        <form onSubmit={handlePinSubmit} className="space-y-5">
          <div className="p-3.5 rounded-xl bg-(--color-primary-muted) border border-(--color-primary)/25 text-xs text-(--color-text-primary) leading-relaxed">
            Hoş geldiniz, <strong>{greetingName}</strong>! Lütfen 4 haneli PIN kodunuzu giriniz.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) mb-2">
              4 Haneli PIN Kodunuz
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-text-secondary)">
                <Lock className="w-5 h-5 text-(--color-primary)" />
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                autoFocus
                required
                className="w-full min-h-[52px] pl-11 pr-4 py-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-2xl tracking-widest font-mono text-center font-bold text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft)"
            disabled={isLoading || pin.length !== 4}
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>

          <div className="pt-3 border-t border-(--color-border-subtle) flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setPin('');
                setError(null);
              }}
              className="min-h-[44px] inline-flex items-center text-(--color-text-secondary) hover:text-(--color-text-primary) font-medium cursor-pointer"
            >
              &larr; Farklı numara gir
            </button>
            <span className="text-(--color-text-secondary) flex items-center gap-1 font-medium" title="Bankoyu arayarak PIN sıfırlama talep edebilirsiniz">
              <HelpCircle className="w-3.5 h-3.5 text-(--color-primary)" /> PIN&apos;imi unuttum
            </span>
          </div>
        </form>
      )}

      {/* ADIM 2B: KAYIT VEYA YENİ PIN BELİRLEME */}
      {step === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-(--color-primary-muted) border border-(--color-primary)/25 text-xs text-(--color-text-primary) leading-relaxed">
            {isExistingPatient ? (
              <>Hoş geldiniz, <strong>{greetingName}</strong>! Kaydınız klinikte açılmış. Lütfen yeni 4 haneli giriş PIN&apos;inizi belirleyiniz.</>
            ) : (
              <>İlk kez giriş yapıyorsunuz. Lütfen bilgilerinizi tamamlayıp 4 haneli giriş PIN&apos;inizi belirleyiniz.</>
            )}
          </div>

          {!isExistingPatient && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
                Adınız
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Adınız"
                required
                autoFocus
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-sm font-medium text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
                Soyadınız
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Soyadınız"
                required
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-sm font-medium text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>
          </div>
          )}

          <div>
            <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
              T.C. Kimlik No <span className="text-[11px] font-normal text-(--color-text-muted)">(Opsiyonel)</span>
            </label>
            <input
              type="text"
              maxLength={11}
              value={tc}
              onChange={(e) => setTc(e.target.value.replace(/\D/g, ''))}
              placeholder="11 haneli kimlik numarası"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-sm font-mono text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">
              4 Haneli Giriş PIN&apos;inizi Belirleyin
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              required
              className="w-full min-h-[50px] px-3.5 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-xl tracking-widest font-mono text-center font-bold text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
            <p className="text-[11px] font-medium text-(--color-text-secondary) mt-1.5">
              Sonraki tüm girişlerinizde bu 4 haneli PIN kodunu kullanacaksınız.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft) mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydı Tamamla & Giriş Yap'}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setError(null);
              }}
              className="min-h-[44px] inline-flex items-center text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-text-primary) cursor-pointer"
            >
              &larr; Numarayı değiştir
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function PatientLoginPage() {
  return (
    <div className="min-h-screen bg-(--color-bg-base) flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-(--color-primary) text-white shadow-(--shadow-glow-primary) mb-3">
            <span className="text-2xl font-black">✦</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-(--color-text-primary)">
            Denta<span className="text-(--color-primary)">Panel</span>
          </h1>
          <p className="text-sm text-(--color-text-secondary) mt-1">
            Hasta Girişi & Randevu Takip Portalı
          </p>
        </div>

        <Suspense fallback={<Card padding="lg" className="animate-pulse h-64"><div /></Card>}>
          <PatientLoginForm />
        </Suspense>

        {/* DESİGN.md 3.D: hasta giriş sayfasında personel menüsü gösterilmez; personel /personel-giris adresini kullanır */}
        <p className="mt-6 text-center text-xs text-(--color-text-secondary) leading-relaxed">
          PIN&apos;inizi mi unuttunuz? Klinik bankosu tek tıkla sıfırlayabilir.
        </p>
      </div>
    </div>
  );
}
