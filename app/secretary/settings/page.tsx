'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getSettingsDataAction, saveProcedureTemplateAction, updateDoctorSettingsAction } from './actions';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Modal } from '@/app/_components/ui/Modal';
import { DEFAULT_SCHEDULE, type WorkingSchedule } from '@/lib/slots';
import { Stethoscope, ListChecks, QrCode, Plus, Pencil, Printer } from 'lucide-react';

type SettingsData = Awaited<ReturnType<typeof getSettingsDataAction>>;
type Doctor = SettingsData['doctors'][number];
type Template = SettingsData['templates'][number];

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SLOT_OPTIONS = [10, 15, 20, 30, 45, 60];

const inputCls =
  'w-full min-h-[44px] px-3 text-sm rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)';

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [editTemplate, setEditTemplate] = useState<Partial<Template> | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await getSettingsDataAction());
    } catch {
      setMessage({ type: 'error', text: 'Ayarlar yüklenemedi.' });
    }
  }, []);

  useEffect(() => {
    getSettingsDataAction()
      .then(setData)
      .catch(() => setMessage({ type: 'error', text: 'Ayarlar yüklenemedi.' }));
  }, []);

  if (!data) {
    return <div className="py-24 text-center text-xs text-(--color-text-secondary)">Ayarlar yükleniyor…</div>;
  }

  const categories = [...new Set(data.templates.map((t) => t.category))];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-(--color-border-subtle)">
        <h1 className="text-xl font-bold text-(--color-text-primary)">Klinik Ayarları</h1>
        <p className="text-xs text-(--color-text-secondary) mt-0.5">Hekim ücretleri ve çalışma saatleri, işlem fiyat kataloğu, check-in QR kodu.</p>
      </div>

      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} aria-label="Kapat" className="px-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* HEKİMLER */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-(--color-text-primary) flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-(--color-primary)" /> Hekimler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.doctors.map((d) => {
            const s = (d.workingSchedule as WorkingSchedule | null) ?? DEFAULT_SCHEDULE;
            return (
              <Card key={d.id} padding="md" className="bg-white border border-(--color-border-subtle) space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-(--color-text-primary) block">
                      {d.title} {d.fullName}
                      {!d.isActive && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Pasif</span>}
                    </span>
                    <span className="text-xs text-(--color-text-secondary)">{d.branch}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditDoctor(d)} icon={<Pencil className="w-3.5 h-3.5" />}>
                    Düzenle
                  </Button>
                </div>
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-(--color-bg-elevated)">
                    <dt className="text-[10px] text-(--color-text-muted)">Ön muayene</dt>
                    <dd className="font-mono font-bold">{Number(d.initialExamFee).toLocaleString('tr-TR')} ₺</dd>
                  </div>
                  <div className="p-2 rounded-xl bg-(--color-bg-elevated)">
                    <dt className="text-[10px] text-(--color-text-muted)">Randevu aralığı</dt>
                    <dd className="font-mono font-bold">{d.defaultSlotMinutes} dk</dd>
                  </div>
                  <div className="p-2 rounded-xl bg-(--color-bg-elevated)">
                    <dt className="text-[10px] text-(--color-text-muted)">Mesai</dt>
                    <dd className="font-mono font-bold">{s.startHour}–{s.endHour}</dd>
                  </div>
                </dl>
                <p className="text-[11px] text-(--color-text-secondary)">
                  {DAY_ORDER.filter((x) => s.days.includes(x)).map((x) => DAY_LABELS[x]).join(', ')}
                  {s.breakStart && s.breakEnd ? ` • Öğle arası ${s.breakStart}–${s.breakEnd}` : ''}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* KATALOG */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-(--color-text-primary) flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-(--color-primary)" /> İşlem & Fiyat Kataloğu
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditTemplate({ name: '', category: 'Genel', defaultPrice: '0', defaultDurationMin: 30, isActive: true })}
            icon={<Plus className="w-4 h-4" />}
          >
            Yeni İşlem
          </Button>
        </div>
        <p className="text-[11px] text-(--color-text-muted)">
          Hekim muayene ekranındaki hazır işlem butonları bu listeden gelir. Fiyat değişikliği yalnızca yeni eklenen tedavi adımlarına yansır; mevcut planlar değişmez.
        </p>
        <div className="bg-white rounded-2xl border border-(--color-border-subtle) overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-(--color-bg-elevated) text-(--color-text-secondary) font-semibold">
                <tr>
                  <th className="py-3 px-4">İşlem</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Süre</th>
                  <th className="py-3 px-4 text-right">Taban Fiyat</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border-subtle)">
                {data.templates.map((t) => (
                  <tr key={t.id} className={t.isActive ? '' : 'opacity-50'}>
                    <td className="py-2.5 px-4 font-semibold">{t.name}</td>
                    <td className="py-2.5 px-4">{t.category}</td>
                    <td className="py-2.5 px-4 font-mono">{t.defaultDurationMin} dk</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">{Number(t.defaultPrice).toLocaleString('tr-TR')} ₺</td>
                    <td className="py-2.5 px-4">{t.isActive ? 'Aktif' : 'Pasif'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <Button variant="ghost" size="xs" onClick={() => setEditTemplate(t)} aria-label={`${t.name} düzenle`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SABİT QR */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-(--color-text-primary) flex items-center gap-2">
          <QrCode className="w-4 h-4 text-(--color-primary)" /> Sabit Stand Check-in QR&apos;ı
        </h2>
        <Card padding="md" className="bg-white border border-(--color-border-subtle) flex flex-col sm:flex-row items-center gap-5">
          <div id="static-qr" className="p-3 bg-white rounded-xl border border-(--color-border-subtle)">
            <QRCodeSVG value={data.staticCheckinUrl} size={180} level="H" />
          </div>
          <div className="text-xs text-(--color-text-secondary) space-y-2 leading-relaxed">
            <p>
              Tablet yerine danışmaya pleksi stand konacaksa bu kodu bastırın. Tablet kioskundaki kod 5 dakikada bir değişir;
              bu kod ise <strong>kalıcıdır</strong>. Klinik dışına çıktığından şüphelenirseniz sunucudaki
              <code className="mx-1 px-1 rounded bg-(--color-bg-elevated)">KIOSK_HMAC_SECRET</code>
              değiştirilerek eski kod iptal edilir.
            </p>
            <Button variant="outline" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
              Yazdır
            </Button>
          </div>
        </Card>
      </section>

      {editDoctor && (
        <DoctorEditModal
          doctor={editDoctor}
          onClose={() => setEditDoctor(null)}
          onSaved={async () => {
            setMessage({ type: 'success', text: `${editDoctor.fullName} ayarları kaydedildi. Yeni saatler randevu ekranlarına hemen yansır.` });
            setEditDoctor(null);
            await load();
          }}
        />
      )}

      {editTemplate && (
        <TemplateEditModal
          template={editTemplate}
          categories={categories}
          onClose={() => setEditTemplate(null)}
          onSaved={async () => {
            setMessage({ type: 'success', text: 'Katalog güncellendi.' });
            setEditTemplate(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function DoctorEditModal({ doctor, onClose, onSaved }: { doctor: Doctor; onClose: () => void; onSaved: () => void }) {
  const initial = (doctor.workingSchedule as WorkingSchedule | null) ?? DEFAULT_SCHEDULE;
  const [fee, setFee] = useState(String(Number(doctor.initialExamFee)));
  const [slot, setSlot] = useState(doctor.defaultSlotMinutes);
  const [days, setDays] = useState<number[]>(initial.days);
  const [startHour, setStartHour] = useState(initial.startHour);
  const [endHour, setEndHour] = useState(initial.endHour);
  const [hasBreak, setHasBreak] = useState(!!(initial.breakStart && initial.breakEnd));
  const [breakStart, setBreakStart] = useState(initial.breakStart ?? '13:00');
  const [breakEnd, setBreakEnd] = useState(initial.breakEnd ?? '14:00');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await updateDoctorSettingsAction({
        doctorId: doctor.id,
        initialExamFee: Number(fee.replace(',', '.')),
        defaultSlotMinutes: slot,
        schedule: { days, startHour, endHour, ...(hasBreak ? { breakStart, breakEnd } : {}) },
      });
      if (res.success) onSaved();
      else setError(res.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`${doctor.title} ${doctor.fullName}`} subtitle="Ücret ve çalışma takvimi" size="md">
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Ön muayene ücreti (₺)</span>
            <input className={`${inputCls} font-mono`} inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} required />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Randevu aralığı</span>
            <select className={inputCls} value={slot} onChange={(e) => setSlot(Number(e.target.value))}>
              {SLOT_OPTIONS.map((m) => <option key={m} value={m}>{m} dk</option>)}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="text-xs font-bold text-(--color-text-secondary) mb-1.5">Çalışma günleri</legend>
          <div className="flex flex-wrap gap-1.5">
            {DAY_ORDER.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])}
                  className={`min-w-[52px] min-h-[40px] px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                    on ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-text-secondary) border-(--color-border-subtle)'
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Mesai başlangıcı</span>
            <input type="time" className={`${inputCls} font-mono`} value={startHour} onChange={(e) => setStartHour(e.target.value)} required />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Mesai bitişi</span>
            <input type="time" className={`${inputCls} font-mono`} value={endHour} onChange={(e) => setEndHour(e.target.value)} required />
          </label>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-(--color-text-primary) min-h-[32px]">
          <input type="checkbox" checked={hasBreak} onChange={(e) => setHasBreak(e.target.checked)} className="w-4 h-4" />
          Öğle arası var
        </label>
        {hasBreak && (
          <div className="grid grid-cols-2 gap-3">
            <input type="time" aria-label="Öğle arası başlangıcı" className={`${inputCls} font-mono`} value={breakStart} onChange={(e) => setBreakStart(e.target.value)} />
            <input type="time" aria-label="Öğle arası bitişi" className={`${inputCls} font-mono`} value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} />
          </div>
        )}

        <p className="text-[11px] text-(--color-text-muted)">Mevcut randevular değişmez; yeni saatler yalnızca bundan sonraki randevu seçimlerinde kullanılır.</p>
        {error && <p role="alert" className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Vazgeç</Button>
          <Button type="submit" variant="primary" loading={saving}>Kaydet</Button>
        </div>
      </form>
    </Modal>
  );
}

function TemplateEditModal({
  template,
  categories,
  onClose,
  onSaved,
}: {
  template: Partial<Template>;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template.name ?? '');
  const [category, setCategory] = useState(template.category ?? 'Genel');
  const [price, setPrice] = useState(String(Number(template.defaultPrice ?? 0)));
  const [duration, setDuration] = useState(template.defaultDurationMin ?? 30);
  const [isActive, setIsActive] = useState(template.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await saveProcedureTemplateAction({
        id: template.id,
        name,
        category,
        defaultPrice: Number(price.replace(',', '.')),
        defaultDurationMin: Number(duration),
        isActive,
      });
      if (res.success) onSaved();
      else setError(res.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={template.id ? 'İşlemi Düzenle' : 'Yeni İşlem'} size="sm">
      <form onSubmit={save} className="space-y-3">
        <label className="block">
          <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">İşlem adı *</span>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Kategori</span>
          <input className={inputCls} list="tpl-categories" value={category} onChange={(e) => setCategory(e.target.value)} />
          <datalist id="tpl-categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Taban fiyat (₺)</span>
            <input className={`${inputCls} font-mono`} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Süre (dk)</span>
            <input className={`${inputCls} font-mono`} type="number" min={5} max={480} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
          </label>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold min-h-[32px]">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
          Hekim ekranında göster (aktif)
        </label>
        {error && <p role="alert" className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Vazgeç</Button>
          <Button type="submit" variant="primary" loading={saving}>Kaydet</Button>
        </div>
      </form>
    </Modal>
  );
}
