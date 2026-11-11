'use client';

import { useCallback, useEffect, useState } from 'react';
import { getKasaReportAction } from './actions';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { clinicDateOffset, clinicToday, CLINIC_TZ } from '@/lib/time';
import { useLiveUpdates } from '@/app/_lib/useLiveUpdates';
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react';

type Report = Awaited<ReturnType<typeof getKasaReportAction>>;

const KIND_LABEL: Record<string, string> = {
  initial_exam: 'Ön Muayene',
  session_prepay: 'Tedavi Seansı',
  same_day_chairside: 'Koltukta Ek İşlem',
};

const tl = (n: number) => `${n.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;

function shiftDate(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export default function KasaReportPage() {
  const [date, setDate] = useState(clinicToday());
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setReport(await getKasaReportAction(date));
      setError(null);
    } catch {
      setError('Kasa raporu yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Bugünün raporu açıkken yeni tahsilatlar anında düşer
  useLiveUpdates(date === clinicToday() ? ['desk'] : [], load, 60_000);

  const t = report?.totals;

  return (
    <div className="space-y-5 print:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-(--color-border-subtle)">
        <div>
          <h1 className="text-xl font-bold text-(--color-text-primary)">Günlük Kasa Raporu</h1>
          <p className="text-xs text-(--color-text-secondary) mt-0.5">POS ve nakit tahsilat dökümü (gün sonu mutabakatı)</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setDate(shiftDate(date, -1))}
            aria-label="Önceki gün"
            className="w-11 h-11 rounded-xl border border-(--color-border-subtle) bg-white inline-flex items-center justify-center cursor-pointer hover:border-(--color-primary)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={date}
            max={clinicToday()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="min-h-[44px] px-3 rounded-xl bg-white border border-(--color-border-subtle) text-sm font-mono"
            aria-label="Rapor tarihi"
          />
          <button
            onClick={() => setDate(shiftDate(date, 1))}
            disabled={date >= clinicToday()}
            aria-label="Sonraki gün"
            className="w-11 h-11 rounded-xl border border-(--color-border-subtle) bg-white inline-flex items-center justify-center cursor-pointer hover:border-(--color-primary) disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {date !== clinicToday() && (
            <Button variant="ghost" size="sm" onClick={() => setDate(clinicToday())}>Bugün</Button>
          )}
          {date === clinicToday() && (
            <Button variant="ghost" size="sm" onClick={() => setDate(clinicDateOffset(-1))}>Dün</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
            Yazdır
          </Button>
        </div>
      </div>

      {error && <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">{error}</p>}

      {loading && !report ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white animate-pulse" />)}
        </div>
      ) : t && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card padding="md" className="bg-white border border-(--color-border-subtle)">
              <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase block">Toplam</span>
              <span className="text-2xl font-black font-mono text-(--color-text-primary)">{tl(t.all)}</span>
              <span className="text-[11px] text-(--color-text-secondary) block">{t.count} işlem</span>
            </Card>
            <Card padding="md" className="bg-white border border-(--color-border-subtle)">
              <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase block">POS</span>
              <span className="text-xl font-black font-mono text-(--color-primary)">{tl(t.pos)}</span>
            </Card>
            <Card padding="md" className="bg-white border border-(--color-border-subtle)">
              <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase block">Nakit</span>
              <span className="text-xl font-black font-mono text-emerald-700">{tl(t.cash)}</span>
            </Card>
            <Card padding="md" className="bg-white border border-(--color-border-subtle) text-[11px] space-y-0.5">
              <span className="font-semibold text-(--color-text-muted) uppercase block">Türe göre</span>
              {Object.entries(KIND_LABEL).map(([k, label]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-(--color-text-secondary)">{label}</span>
                  <span className="font-mono font-bold">{tl(t[k as keyof typeof t] as number)}</span>
                </div>
              ))}
            </Card>
          </div>

          <div className="bg-white rounded-2xl border border-(--color-border-subtle) overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-(--color-bg-elevated) text-(--color-text-secondary) font-semibold">
                  <tr>
                    <th className="py-3 px-4">Saat</th>
                    <th className="py-3 px-4">Hasta</th>
                    <th className="py-3 px-4">Kalem</th>
                    <th className="py-3 px-4">Yöntem</th>
                    <th className="py-3 px-4">Alan</th>
                    <th className="py-3 px-4 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border-subtle)">
                  {report!.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-(--color-text-secondary)">Bu gün için tahsilat kaydı yok.</td>
                    </tr>
                  ) : (
                    report!.rows.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-4 font-mono">
                          {new Date(r.collectedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: CLINIC_TZ })}
                        </td>
                        <td className="py-2.5 px-4 font-semibold">{r.patientName}</td>
                        <td className="py-2.5 px-4">
                          {KIND_LABEL[r.kind]}
                          {r.stepTitle && <span className="block text-[11px] text-(--color-text-muted)">{r.stepTitle}</span>}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.method === 'pos' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'}`}>
                            {r.method === 'pos' ? 'POS' : 'Nakit'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-(--color-text-secondary)">{r.staffName}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">{tl(r.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
