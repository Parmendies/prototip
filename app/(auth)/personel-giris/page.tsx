'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginStaffAction } from './actions';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Mail, Lock, Shield, UserCheck, Stethoscope } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginStaffAction(formData);
      if (res.success && res.redirectUrl) {
        // Korumalı sayfadan (ör. /kiosk) gelindiyse oraya dön; yalnızca site içi adresler
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        const safe = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
        router.push(safe ? returnUrl : res.redirectUrl);
      } else {
        setError(res.error || 'Giriş başarısız oldu.');
      }
    } catch {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-(--color-bg-base) flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-(--color-text-primary) text-white shadow-lg mb-3">
            <Shield className="w-7 h-7 text-(--color-primary)" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-(--color-text-primary)">
            Denta<span className="text-(--color-primary)">Panel</span> Personel
          </h1>
          <p className="text-sm text-(--color-text-secondary) mt-1">
            Klinik Banko & Hekim Operasyon Girişi
          </p>
        </div>

        <Card padding="lg" className="shadow-(--shadow-lg)">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-(--color-error-muted) border border-red-200 text-xs text-(--color-error) font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) mb-1.5">
                Kurumsal E-Posta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-text-secondary)">
                  <Mail className="w-5 h-5 text-(--color-primary)" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="sekreter@dentapanel.com"
                  autoFocus
                  required
                  className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-sm font-medium text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-(--color-text-secondary) mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-text-secondary)">
                  <Lock className="w-5 h-5 text-(--color-primary)" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-sm font-medium text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center min-h-[48px] text-sm font-bold shadow-(--shadow-primary-soft) mt-3"
              disabled={isLoading}
            >
              {isLoading ? 'Doğrulanıyor...' : 'Personel Girişi Yap'}
            </Button>
          </form>

          {/* Hazır test hesapları yalnızca geliştirme ortamında görünür */}
          {process.env.NODE_ENV !== 'production' && (
          <div className="mt-6 pt-5 border-t border-(--color-border-subtle)">
            <p className="text-[11px] font-bold text-(--color-text-secondary) uppercase tracking-wider mb-2">
              Hazır Test Hesapları (Şifre: 123456)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                  const pwInput = document.querySelector('input[name="password"]') as HTMLInputElement;
                  if (emailInput && pwInput) {
                    emailInput.value = 'sekreter@dentapanel.com';
                    pwInput.value = '123456';
                  }
                }}
                className="p-2.5 min-h-[44px] rounded-xl bg-(--color-bg-elevated) hover:bg-(--color-primary-muted) text-left flex items-center gap-2 border border-(--color-border-subtle) transition-colors cursor-pointer select-none"
              >
                <UserCheck className="w-4 h-4 text-(--color-primary) shrink-0" />
                <span className="font-semibold text-(--color-text-primary) truncate">Sekreter / Banko</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
                  const pwInput = document.querySelector('input[name="password"]') as HTMLInputElement;
                  if (emailInput && pwInput) {
                    emailInput.value = 'zeynep@dentapanel.com';
                    pwInput.value = '123456';
                  }
                }}
                className="p-2.5 min-h-[44px] rounded-xl bg-(--color-bg-elevated) hover:bg-(--color-primary-muted) text-left flex items-center gap-2 border border-(--color-border-subtle) transition-colors cursor-pointer select-none"
              >
                <Stethoscope className="w-4 h-4 text-(--color-primary) shrink-0" />
                <span className="font-semibold text-(--color-text-primary) truncate">Dr. Zeynep</span>
              </button>
            </div>
          </div>
          )}
        </Card>

        {/* Back to patient portal */}
        <div className="mt-6 text-center">
          <a
            href="/giris"
            className="inline-flex items-center justify-center min-h-[44px] text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-primary) transition-colors"
          >
            &larr; Hasta Giriş Sayfasına Dön
          </a>
        </div>
      </div>
    </div>
  );
}

