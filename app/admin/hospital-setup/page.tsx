'use client';

import AdminHeader from '../_components/AdminHeader';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Input, Textarea } from '@/app/_components/ui/Input';
import { Badge } from '@/app/_components/ui/Badge';
import { useState } from 'react';
import { Building2, Phone, Mail, Globe, Clock, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/app/_lib/utils';

const steps = [
  { id: 1, label: 'Temel Bilgiler', icon: <Building2 size={15} /> },
  { id: 2, label: 'İletişim',       icon: <Phone size={15} /> },
  { id: 3, label: 'Vizyon & Saat', icon: <Clock size={15} /> },
];

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const defaultHours = DAYS.map((day) => ({
  day,
  isOpen: !['Cumartesi', 'Pazar'].includes(day),
  start: '09:00',
  end: '18:00',
}));

export default function HospitalSetupPage() {
  const [step, setStep] = useState(1);
  const [hours, setHours] = useState(defaultHours);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdminHeader
        title="Hastane Ayarları"
        subtitle="Hastanenizin bilgilerini güncelleyin"
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8 max-w-xl">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                id={`setup-step-${s.id}`}
                onClick={() => setStep(s.id)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-all',
                  step === s.id
                    ? 'text-(--color-primary)'
                    : step > s.id
                    ? 'text-(--color-success)'
                    : 'text-(--color-text-muted)'
                )}
              >
                <span className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 transition-all',
                  step === s.id
                    ? 'border-(--color-primary) bg-(--color-primary-muted) text-(--color-primary)'
                    : step > s.id
                    ? 'border-(--color-success) bg-(--color-success-muted) text-(--color-success)'
                    : 'border-(--color-border) text-(--color-text-muted)'
                )}>
                  {step > s.id ? <Check size={12} /> : s.id}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-3 transition-colors',
                  step > s.id ? 'bg-(--color-success)' : 'bg-(--color-border-subtle)'
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-5xl">
          {/* Form panel */}
          <div className="col-span-2 space-y-5">

            {/* STEP 1 */}
            {step === 1 && (
              <Card className="animate-slide-up space-y-5">
                <h2 className="text-sm font-semibold text-(--color-text-primary)">Temel Bilgiler</h2>

                {/* Logo upload */}
                <div>
                  <p className="text-sm font-medium text-(--color-text-secondary) mb-2">Hastane Logosu</p>
                  <div
                    id="logo-upload-area"
                    className="border-2 border-dashed border-(--color-border) rounded-xl p-8 text-center cursor-pointer hover:border-(--color-primary) hover:bg-(--color-primary-muted) transition-all duration-200 group"
                  >
                    <div className="text-3xl mb-2">🏥</div>
                    <p className="text-sm text-(--color-text-muted) group-hover:text-(--color-primary) transition-colors">
                      Logo yüklemek için tıklayın veya sürükleyin
                    </p>
                    <p className="text-xs text-(--color-text-muted) mt-1">PNG, JPG, SVG — Maks. 2 MB</p>
                  </div>
                </div>

                <Input id="hospital-name" label="Hastane Adı" placeholder="Örn: Özel Medikum Hastanesi" defaultValue="Özel Medikum Hastanesi" required />
                <Input id="hospital-slug" label="Sistem Kodu (Slug)" placeholder="medikum" defaultValue="medikum" hint="Sistemde tanımlayıcı olarak kullanılır. Değiştirilmesi önerilmez." />

                <div className="grid grid-cols-2 gap-4">
                  <Input id="hospital-city" label="Şehir" placeholder="İstanbul" defaultValue="İstanbul" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-(--color-text-secondary)">Durum</label>
                    <div className="flex gap-2 mt-1">
                      {['Aktif', 'Pasif'].map((s) => (
                        <button
                          key={s}
                          className={cn(
                            'px-3 py-2 rounded-xl text-sm border transition-all',
                            s === 'Aktif'
                              ? 'border-(--color-success) bg-(--color-success-muted) text-(--color-success)'
                              : 'border-(--color-border) text-(--color-text-muted)'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Textarea id="hospital-address" label="Adres" placeholder="Mahalle, Sokak, No, İlçe, Şehir" rows={3} defaultValue="Bağcılar Mah. Sağlık Cad. No: 42, Bağcılar, İstanbul" />
              </Card>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <Card className="animate-slide-up space-y-5">
                <h2 className="text-sm font-semibold text-(--color-text-primary)">İletişim Bilgileri</h2>
                <Input id="hospital-phone" label="Telefon" placeholder="+90 212 000 0000" leftIcon={<Phone size={14} />} defaultValue="+90 212 555 0100" />
                <Input id="hospital-email" label="E-posta" type="email" placeholder="info@hastane.com" leftIcon={<Mail size={14} />} defaultValue="info@medikum.com.tr" />
                <Input id="hospital-website" label="Web Sitesi" placeholder="www.hastane.com" leftIcon={<Globe size={14} />} defaultValue="www.medikum.com.tr" />

                <div className="pt-2 divider" />

                {/* Meta Integration preview */}
                <h3 className="text-sm font-semibold text-(--color-text-primary) pt-2">Meta Entegrasyonu</h3>
                <p className="text-xs text-(--color-text-muted)">Instagram ve Telegram Business hesabınızı bağlayarak sosyal medyadan gelen hastaları otomatik kaydedin.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Instagram Business', icon: '📷', status: 'Bağlı', color: 'success' },
                    { name: 'Telegram Page', icon: 'f', status: 'Bağlı Değil', color: 'warning' },
                  ].map((meta) => (
                    <div key={meta.name} className="flex items-center gap-3 p-3 rounded-xl border border-(--color-border-subtle) bg-(--color-bg-elevated)">
                      <span className="text-2xl">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-(--color-text-primary) truncate">{meta.name}</p>
                        <Badge status={meta.status === 'Bağlı' ? 'active' : 'pending'} size="xs" dot>{meta.status}</Badge>
                      </div>
                      <Button variant="outline" size="xs">
                        {meta.status === 'Bağlı' ? 'Yönet' : 'Bağla'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <Card className="animate-slide-up space-y-5">
                <h2 className="text-sm font-semibold text-(--color-text-primary)">Vizyon, Misyon & Çalışma Saatleri</h2>
                <Textarea id="hospital-vision" label="Vizyon" placeholder="Hastane vizyonunuz..." rows={3} defaultValue="Hasta odaklı, teknoloji destekli sağlık deneyiminde İstanbul'un referans hastanesi olmak." />
                <Textarea id="hospital-mission" label="Misyon" placeholder="Hastane misyonunuz..." rows={3} defaultValue="Her hastaya bireysel ilgi göstererek, en güncel tıbbi yöntemlerle şifaya ulaşmalarını sağlamak." />

                <div className="pt-2 divider" />
                <h3 className="text-sm font-semibold text-(--color-text-primary) pt-2">Çalışma Saatleri</h3>
                <div className="space-y-2">
                  {hours.map((h, i) => (
                    <div key={h.day} className="flex items-center gap-3">
                      <button
                        onClick={() => setHours(prev => prev.map((x, j) => j === i ? { ...x, isOpen: !x.isOpen } : x))}
                        className={cn(
                          'w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0',
                          h.isOpen
                            ? 'border-(--color-primary) bg-(--color-primary)'
                            : 'border-(--color-border)'
                        )}
                        aria-label={`${h.day} ${h.isOpen ? 'kapat' : 'aç'}`}
                      >
                        {h.isOpen && <Check size={10} className="text-[hsl(222,47%,7%)]" />}
                      </button>
                      <span className="text-sm text-(--color-text-secondary) w-24 shrink-0">{h.day}</span>
                      {h.isOpen ? (
                        <>
                          <select
                            className="px-2 py-1 text-xs rounded-lg border border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary)"
                            value={h.start}
                            onChange={e => setHours(prev => prev.map((x, j) => j === i ? { ...x, start: e.target.value } : x))}
                          >
                            {['08:00','09:00','10:00'].map(t => <option key={t}>{t}</option>)}
                          </select>
                          <span className="text-(--color-text-muted) text-xs">—</span>
                          <select
                            className="px-2 py-1 text-xs rounded-lg border border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary)"
                            value={h.end}
                            onChange={e => setHours(prev => prev.map((x, j) => j === i ? { ...x, end: e.target.value } : x))}
                          >
                            {['17:00','18:00','19:00','20:00'].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </>
                      ) : (
                        <span className="text-xs text-(--color-text-muted) italic">Kapalı</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                ← Geri
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(s => Math.min(3, s + 1))} iconRight={<ChevronRight size={14} />}>
                  Devam
                </Button>
              ) : (
                <Button
                  variant={saved ? 'success' : 'primary'}
                  onClick={handleSave}
                  icon={saved ? <Check size={14} /> : undefined}
                >
                  {saved ? 'Kaydedildi!' : 'Kaydet'}
                </Button>
              )}
            </div>
          </div>

          {/* Preview card */}
          <div className="space-y-4">
            <Card glass>
              <p className="text-xs font-semibold text-(--color-text-muted) mb-3 uppercase tracking-wider">Ön İzleme</p>
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-(--color-primary) to-(--color-secondary) flex items-center justify-center text-2xl mx-auto mb-3 shadow-(--shadow-glow-primary)">
                  🏥
                </div>
                <h3 className="font-bold text-(--color-text-primary)">Özel Medikum</h3>
                <p className="text-xs text-(--color-text-muted) mt-1">İstanbul</p>
                <Badge status="active" dot size="xs" className="mt-2">Aktif</Badge>
              </div>
              <div className="space-y-2 pt-3 divider">
                <p className="pt-3 text-xs text-(--color-text-muted)">info@medikum.com.tr</p>
                <p className="text-xs text-(--color-text-muted)">+90 212 555 0100</p>
                <p className="text-xs text-(--color-text-muted)">www.medikum.com.tr</p>
              </div>
            </Card>

            <Card>
              <p className="text-xs font-medium text-(--color-text-muted) mb-2">Adımlar</p>
              {steps.map((s) => (
                <div key={s.id} className={cn(
                  'flex items-center gap-2 py-1.5 text-xs',
                  step >= s.id ? 'text-(--color-text-secondary)' : 'text-(--color-text-muted)'
                )}>
                  <span className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0',
                    step > s.id
                      ? 'bg-(--color-success) text-white'
                      : step === s.id
                      ? 'bg-(--color-primary) text-[hsl(222,47%,7%)]'
                      : 'bg-(--color-bg-elevated) text-(--color-text-muted)'
                  )}>
                    {step > s.id ? '✓' : s.id}
                  </span>
                  {s.label}
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
