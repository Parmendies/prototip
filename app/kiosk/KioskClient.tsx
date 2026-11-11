'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, ShieldCheck, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getKioskTokenAction } from './actions';

export default function KioskClient({
  initialToken,
  origin,
}: {
  initialToken: { token: string; expiresAt: number };
  origin: string;
}) {
  const [token, setToken] = useState(initialToken);
  const checkinUrl = `${origin}/checkin?k=${encodeURIComponent(token.token)}`;

  // Kod 5 dakikada bir döner; süresi dolmadan yenisi alınır
  useEffect(() => {
    const wait = Math.max(5_000, token.expiresAt - Date.now() + 1_000);
    const t = setTimeout(async () => {
      try {
        setToken(await getKioskTokenAction());
      } catch {
        // Oturum düştüyse sayfa yenilenince giriş ekranına yönlenir
        setTimeout(() => window.location.reload(), 30_000);
      }
    }, wait);
    return () => clearTimeout(t);
  }, [token]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Generate check-in URL based on current host

    function updateTime() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('tr-TR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    }

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 select-none">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-(--color-primary) flex items-center justify-center text-white text-2xl font-black shadow-lg">
            ✦
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Denta<span className="text-(--color-primary-light)">Panel</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-400">
                Giriş Noktası
              </span>
            </h1>
            <p className="text-xs text-slate-400">Danışma & Hızlı Check-in Standı</p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white flex items-center gap-2 justify-end">
            <Clock className="w-6 h-6 text-(--color-primary-light) animate-pulse" />
            <span>{currentTime || '09:00'}</span>
          </div>
          <p className="text-xs text-slate-300 capitalize mt-0.5">{currentDate}</p>
        </div>
      </header>

      {/* Main Kiosk Content */}
      <main className="flex-1 flex flex-col items-center justify-center my-8 text-center max-w-xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-slate-200 font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Randevunuza Hoş Geldiniz</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
          Saniyeler İçinde <br />
          <span className="text-(--color-primary-light)">Check-in Yapın</span>
        </h2>
        <p className="text-sm text-slate-300 mb-8 max-w-md font-normal leading-relaxed">
          Uygulama indirmeye gerek yok. Telefonunuzun <strong>normal kamerasını</strong> aşağıdaki QR koda tutmanız yeterlidir.
        </p>

        {/* QR Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-2xl flex flex-col items-center border-4 border-(--color-primary)/40">
          <div className="bg-white p-3 rounded-2xl">
            {checkinUrl ? (
              <QRCodeSVG
                value={checkinUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            ) : (
              <div className="w-[220px] h-[220px] bg-slate-100 rounded-2xl animate-pulse" />
            )}
          </div>

          <div className="mt-5 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-(--color-primary-dark) bg-(--color-primary-muted) px-4 py-2 rounded-xl">
              <Smartphone className="w-4 h-4" />
              <span>Telefon Kamerasını Okutunuz</span>
            </div>
          </div>
        </div>

        {/* Test bağlantısı yalnızca geliştirme ortamında */}
        {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8">
          <Link
            href={`/checkin?k=${encodeURIComponent(token.token)}`}
            className="inline-flex items-center justify-center min-h-[44px] gap-2 text-xs font-medium text-slate-300 hover:text-white px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10"
          >
            <span>Test: Check-in Sayfasını Doğrudan Aç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/10 text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Klinik Giriş & Hasta Sıra Güvenlik Sistemi</span>
        </div>
        <div>
          Telefonunuz yoksa lütfen <strong>Banko / Sekretere</strong> müracaat ediniz.
        </div>
      </footer>
    </div>
  );
}

