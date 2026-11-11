'use client';

import { useEffect, useState } from 'react';
import type { Slot } from '@/lib/slots';
import { clinicToday } from '@/lib/time';

export interface DoctorOption {
  id: string;
  title: string;
  fullName: string;
  branch: string;
}

const fieldCls =
  'w-full min-h-[44px] px-3.5 py-2.5 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) font-semibold focus:outline-none focus:ring-2 focus:ring-(--color-primary)';

/**
 * Banko için hekim + tarih + gerçek boş saat seçici.
 * `loadSlots` sunucudan slot listesini getirir; `refreshKey` değişince liste yeniden çekilir.
 */
export function SlotPicker({
  doctors,
  doctorId,
  onDoctorChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  loadSlots,
  lockDoctor = false,
  durationLabel,
  refreshKey = 0,
}: {
  doctors: DoctorOption[];
  doctorId: string;
  onDoctorChange: (id: string) => void;
  date: string;
  onDateChange: (d: string) => void;
  time: string;
  onTimeChange: (t: string) => void;
  loadSlots: (doctorId: string, date: string) => Promise<{ slots: Slot[] }>;
  lockDoctor?: boolean;
  durationLabel?: string;
  refreshKey?: number;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId || !date) return;
    let cancelled = false;
    setLoading(true);
    loadSlots(doctorId, date)
      .then((res) => !cancelled && setSlots(res.slots))
      .catch(() => !cancelled && setSlots([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // loadSlots bilinçli olarak bağımlılık dışı (her render'da yeni fonksiyon gelebilir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date, refreshKey]);

  const anyAvailable = slots.some((s) => s.available);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">Hekim *</span>
          <select
            value={doctorId}
            onChange={(e) => {
              onDoctorChange(e.target.value);
              onTimeChange('');
            }}
            disabled={lockDoctor}
            className={`${fieldCls} disabled:opacity-70`}
            required
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} {d.fullName} ({d.branch})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">Tarih *</span>
          <input
            type="date"
            value={date}
            min={clinicToday()}
            onChange={(e) => {
              onDateChange(e.target.value);
              onTimeChange('');
            }}
            className={`${fieldCls} font-mono`}
            required
          />
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-(--color-text-secondary)">Saat *</span>
          {durationLabel && <span className="text-[11px] text-(--color-text-muted)">{durationLabel}</span>}
        </div>
        {loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5" aria-busy="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-(--color-bg-elevated) animate-pulse" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="px-3 py-3 rounded-xl border border-dashed border-(--color-border-subtle) text-xs text-(--color-text-secondary)">
            Hekim bu gün çalışmıyor veya tarih geçmiş. Başka bir gün seçiniz.
          </p>
        ) : (
          <>
            {!anyAvailable && (
              <p className="mb-1.5 text-xs font-semibold text-amber-800">Bu günün tüm saatleri dolu.</p>
            )}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
              {slots.map((s) => {
                const selected = s.time === time;
                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => onTimeChange(s.time)}
                    title={!s.available ? (s.reason === 'busy' ? 'Dolu' : 'Uygun değil') : undefined}
                    aria-pressed={selected}
                    className={`min-h-[40px] rounded-lg text-xs font-mono font-bold border transition-colors ${
                      selected
                        ? 'bg-(--color-primary) text-white border-(--color-primary)'
                        : s.available
                          ? 'bg-white border-(--color-border-subtle) text-(--color-text-primary) hover:border-(--color-primary) cursor-pointer'
                          : 'bg-(--color-bg-elevated) border-transparent text-(--color-text-muted) line-through cursor-not-allowed'
                    }`}
                  >
                    {s.time}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
