'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getSecretaryDeskData,
  approvePreRequestAction,
  cancelAppointmentAction,
  getDoctorsListAction,
  getSlotsForRequestAction,
} from '../desk/actions';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { ConfirmDialog } from '@/app/_components/ui/ConfirmDialog';
import { SlotPicker, type DoctorOption } from '../_components/SlotPicker';
import { useLiveUpdates } from '@/app/_lib/useLiveUpdates';
import { Check, X, Phone, Inbox, CalendarClock } from 'lucide-react';

type DeskData = Awaited<ReturnType<typeof getSecretaryDeskData>>;
type PendingRequest = DeskData['pendingRequests'][number];

const CANCEL_REASONS = [
  'Hasta ile görüşüldü, randevudan vazgeçti',
  'Hastaya ulaşılamadı',
  'Uygun saat bulunamadı',
];

export default function SecretaryRequestsPage() {
  const [data, setData] = useState<DeskData | null>(null);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Değiştirerek onaylama
  const [revising, setRevising] = useState<PendingRequest | null>(null);
  const [revDoctorId, setRevDoctorId] = useState('');
  const [revDate, setRevDate] = useState('');
  const [revTime, setRevTime] = useState('');
  const [revError, setRevError] = useState<string | null>(null);
  const [revRefresh, setRevRefresh] = useState(0);

  // İptal
  const [cancelling, setCancelling] = useState<PendingRequest | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  const loadData = useCallback(async () => {
    try {
      setData(await getSecretaryDeskData());
    } catch {
      setMessage({ type: 'error', text: 'Talepler yüklenemedi. Bağlantınızı kontrol ediniz.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    getDoctorsListAction().then(setDoctors).catch(() => {});
  }, [loadData]);

  useLiveUpdates(['desk'], loadData);

  async function handleApprove(req: PendingRequest) {
    setProcessingId(req.id);
    setMessage(null);
    try {
      const res = await approvePreRequestAction(req.id);
      setMessage(
        res.success
          ? { type: 'success', text: `${req.patientName} randevusu onaylandı; hastaya bildirim gönderildi.` }
          : { type: 'error', text: res.error || 'Talep onaylanamadı.' }
      );
      await loadData();
    } catch {
      setMessage({ type: 'error', text: 'Onaylama sırasında hata oluştu.' });
    } finally {
      setProcessingId(null);
    }
  }

  function openRevision(req: PendingRequest) {
    setRevising(req);
    setRevDoctorId(req.doctorId);
    setRevDate(req.date);
    setRevTime(req.startTime.slice(0, 5));
    setRevError(null);
  }

  async function submitRevision() {
    if (!revising) return;
    if (!revTime) {
      setRevError('Lütfen bir saat seçiniz.');
      return;
    }
    setRevError(null);
    const res = await approvePreRequestAction(revising.id, {
      doctorId: revDoctorId,
      date: revDate,
      startTime: revTime,
    });
    if (res.success) {
      setMessage({
        type: 'success',
        text: `${revising.patientName} randevusu ${revDate} ${revTime} olarak güncellenip onaylandı.`,
      });
      setRevising(null);
      await loadData();
    } else {
      setRevError(res.error || 'Onaylanamadı.');
      setRevTime('');
      setRevRefresh((n) => n + 1);
    }
  }

  async function submitCancel() {
    if (!cancelling) return;
    const res = await cancelAppointmentAction(cancelling.id, cancelReason);
    setMessage(
      res.success
        ? { type: 'success', text: 'Talep iptal edildi; hastaya bildirim gönderildi.' }
        : { type: 'error', text: res.error || 'Talep iptal edilemedi.' }
    );
    setCancelling(null);
    await loadData();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-(--color-text-secondary)">Ön talepler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const requests = data?.pendingRequests || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-(--color-border-subtle)">
        <div>
          <h1 className="text-xl font-bold text-(--color-text-primary) flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-700" />
            <span>Gelen Randevu Ön Talepleri</span>
          </h1>
          <p className="text-xs text-(--color-text-secondary) mt-0.5">
            Hastayı arayıp teyit ediniz; gerekirse saati veya hekimi değiştirerek onaylayınız.
          </p>
        </div>

        {requests.length > 0 && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 font-mono border border-amber-300">
            {requests.length} Bekleyen Talep
          </span>
        )}
      </div>

      {message && (
        <div
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} aria-label="Kapat" className="text-xs font-bold px-2 py-0.5 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-(--color-border-subtle) shadow-xs space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-(--color-bg-elevated) text-(--color-text-muted) flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-(--color-text-primary)">Bekleyen Yeni Ön Talep Yok</h3>
          <p className="text-xs text-(--color-text-secondary) mt-1 max-w-sm mx-auto leading-relaxed">
            Yeni talepler bu sayfaya otomatik düşer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <Card key={req.id} padding="md" className="border border-amber-200 bg-amber-50/30 shadow-xs space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-(--color-text-primary)">{req.patientName}</h3>
                  <a
                    href={`tel:${req.patientPhone}`}
                    className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-(--color-primary) font-mono mt-0.5 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> {req.patientPhone} (Hemen Ara)
                  </a>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-950 block">
                    {req.date} — {req.startTime.slice(0, 5)}
                  </span>
                  {req.visitType === 'treatment_session' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-primary-muted) text-(--color-primary) inline-block">
                      Tedavi Seansı Talebi
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/90 border border-amber-100 text-xs flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-(--color-text-secondary) block">Talep Edilen Hekim:</span>
                  <span className="font-bold text-(--color-text-primary) truncate block">
                    {req.doctorTitle} {req.doctorName} ({req.doctorBranch})
                  </span>
                </div>
                {req.visitType !== 'treatment_session' && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-semibold text-(--color-text-secondary) block">Muayene Ücreti:</span>
                    <span className="font-mono font-bold text-(--color-primary) text-xs">
                      {Number(req.initialExamFee).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                )}
              </div>

              {req.complaintText && (
                <div className="text-xs text-slate-800 bg-white/70 p-3 rounded-xl border border-amber-100 leading-relaxed">
                  <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider block mb-0.5">
                    Hasta Notu:
                  </span>
                  <p className="italic font-medium">&ldquo;{req.complaintText}&rdquo;</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/60">
                <Button
                  onClick={() => handleApprove(req)}
                  variant="primary"
                  size="md"
                  className="col-span-3 sm:col-span-1 justify-center text-xs font-bold"
                  disabled={processingId === req.id}
                  loading={processingId === req.id}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Onayla
                </Button>
                <Button
                  onClick={() => openRevision(req)}
                  variant="secondary"
                  size="md"
                  className="col-span-2 sm:col-span-1 justify-center text-xs font-bold"
                  disabled={processingId === req.id}
                >
                  <CalendarClock className="w-4 h-4 mr-1" />
                  Değiştir & Onayla
                </Button>
                <Button
                  onClick={() => {
                    setCancelReason(CANCEL_REASONS[0]);
                    setCancelling(req);
                  }}
                  variant="outline"
                  size="md"
                  className="justify-center text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  disabled={processingId === req.id}
                >
                  <X className="w-4 h-4 mr-1" />
                  İptal
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!revising}
        title="Değiştirerek Onayla"
        size="md"
        message={
          revising && (
            <>
              <strong>{revising.patientName}</strong> ile telefonda anlaştığınız hekim, tarih ve saati seçiniz.
              Hastaya güncel bilgiyle bildirim gider.
            </>
          )
        }
        confirmLabel="Yeni Saatle Onayla"
        onConfirm={submitRevision}
        onClose={() => setRevising(null)}
      >
        {revising && (
          <div className="mt-3 space-y-3">
            <SlotPicker
              doctors={doctors}
              doctorId={revDoctorId}
              onDoctorChange={setRevDoctorId}
              date={revDate}
              onDateChange={setRevDate}
              time={revTime}
              onTimeChange={setRevTime}
              lockDoctor={revising.visitType === 'treatment_session'}
              durationLabel={revising.visitType === 'treatment_session' ? `Seans süresi: ${revising.durationMin} dk` : undefined}
              loadSlots={(docId, d) => getSlotsForRequestAction(revising.id, docId, d)}
              refreshKey={revRefresh}
            />
            {revError && (
              <p role="alert" className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium">
                {revError}
              </p>
            )}
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={!!cancelling}
        title="Talebi İptal Et"
        danger
        confirmLabel="İptal Et"
        message={cancelling && <><strong>{cancelling.patientName}</strong> talebi iptal edilecek ve hastaya bildirilecek.</>}
        onConfirm={submitCancel}
        onClose={() => setCancelling(null)}
      >
        <label className="block mt-3">
          <span className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">Sebep</span>
          <select
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full min-h-[44px] px-3 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle)"
          >
            {CANCEL_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </ConfirmDialog>
    </div>
  );
}
