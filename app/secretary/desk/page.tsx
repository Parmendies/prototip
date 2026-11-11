'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getSecretaryDeskData,
  collectPaymentAction,
  manualCheckinAction,
  resetPatientPinAction,
  markNoShowAction,
} from './actions';
import { ConfirmDialog } from '@/app/_components/ui/ConfirmDialog';
import { SessionBookingModal, type SessionPatient } from '../_components/SessionBookingModal';
import { useLiveUpdates } from '@/app/_lib/useLiveUpdates';
import { minutesUntilAppointment } from '@/lib/time';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import {
  CreditCard,
  Banknote,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Phone,
  Calendar,
  Zap,
} from 'lucide-react';


export default function SecretaryDeskPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getSecretaryDeskData>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [sessionPatient, setSessionPatient] = useState<SessionPatient | null>(null);
  const [pinTarget, setPinTarget] = useState<{ id: string; name: string } | null>(null);
  const [noShowTarget, setNoShowTarget] = useState<{ id: string; name: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await getSecretaryDeskData();
      setData(res);
    } catch {
      // Geçici bağlantı hatası: bir sonraki canlı sinyalde tekrar denenir
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // QR okutma, hekim çağırma, koltuk kilidi vb. her değişiklikte anında yenilenir (Supabase Realtime)
  useLiveUpdates(['desk'], loadData, 20_000);

  async function handleCollectPayment(
    appointmentId: string,
    method: 'pos' | 'cash',
    isChairside: boolean
  ) {
    if (processingId) return; // çift tıklama koruması (sunucu tarafında da idempotent)
    setProcessingId(appointmentId);
    setMessage(null);
    try {
      // Tutar sunucuda hesaplanır; istemci yalnızca yöntemi bildirir
      const res = await collectPaymentAction({ appointmentId, method });
      if (res.success) {
        const amountText = res.amount != null ? `${res.amount.toLocaleString('tr-TR')} ₺ ` : '';
        setMessage({
          type: 'success',
          text: isChairside
            ? `${amountText}ek işlem tahsilatı kaydedildi (${method.toUpperCase()}). Randevu kapatıldı.`
            : `${amountText}tahsilat kaydedildi (${method.toUpperCase()}). Hasta hekimin bekleme odasına aktarıldı.`,
        });
      } else {
        setMessage({ type: 'error', text: res.error || 'Tahsilat kaydedilemedi.' });
      }
      await loadData();
    } catch {
      setMessage({ type: 'error', text: 'İşlem sırasında hata oluştu.' });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleManualCheckin(appointmentId: string) {
    setProcessingId(appointmentId);
    try {
      const res = await manualCheckinAction(appointmentId);
      if (res.success) {
        setMessage({ type: 'success', text: 'Hasta manuel olarak "Geldi" işaretlendi. Kasa tahsilatı yapabilirsiniz.' });
      } else {
        setMessage({ type: 'error', text: res.error || 'İşlem yapılamadı.' });
      }
      await loadData();
    } finally {
      setProcessingId(null);
    }
  }

  async function confirmResetPin() {
    if (!pinTarget) return;
    const res = await resetPatientPinAction(pinTarget.id);
    setMessage(
      res.success
        ? { type: 'success', text: `${pinTarget.name} hastasının PIN kodu sıfırlandı. Hasta bir sonraki girişinde yeni PIN belirleyecek.` }
        : { type: 'error', text: res.error || 'PIN sıfırlanamadı.' }
    );
    setPinTarget(null);
    await loadData();
  }

  async function confirmNoShow() {
    if (!noShowTarget) return;
    const res = await markNoShowAction(noShowTarget.id);
    setMessage(
      res.success
        ? { type: 'success', text: `${noShowTarget.name} "Gelmedi" olarak işaretlendi; takvimdeki yeri boşaltıldı.` }
        : { type: 'error', text: res.error || 'İşlem yapılamadı.' }
    );
    setNoShowTarget(null);
    await loadData();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-(--color-text-secondary)">Canlı banko masası yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Filter groups
  const needingPayment = data.todayAppointments.filter(
    (a) => a.status === 'checked_in_unpaid' || a.status === 'awaiting_chairside_payment'
  );
  const inWaitingRoom = data.todayAppointments.filter((a) => a.status === 'waiting_room');
  const inChair = data.todayAppointments.filter((a) => a.status === 'in_chair');

  return (
    <div className="space-y-6">
      {/* Top Counters & Kasa Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="md" className="border border-(--color-border-subtle) bg-white">
          <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase block">
            Bugün Toplam Kasa
          </span>
          <div className="text-2xl font-black text-(--color-text-primary) font-mono mt-1">
            {data.kasaSummary.totalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-(--color-text-secondary) mt-1 flex items-center justify-between">
            <span>POS: {data.kasaSummary.totalPos.toLocaleString('tr-TR')} ₺</span>
            <span>Nakit: {data.kasaSummary.totalCash.toLocaleString('tr-TR')} ₺</span>
          </div>
        </Card>

        <Card padding="md" className={`border ${needingPayment.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-(--color-border-subtle)'}`}>
          <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase block">
            Ödeme Bekleyenler
          </span>
          <div className={`text-2xl font-black font-mono mt-1 ${needingPayment.length > 0 ? 'text-orange-600' : 'text-(--color-text-primary)'}`}>
            {needingPayment.length}
          </div>
          <span className="text-[11px] text-(--color-text-secondary) mt-1 block">
            QR Okutan & Kasa Onayı
          </span>
        </Card>

        <Card padding="md" className="border border-(--color-border-subtle) bg-white">
          <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase block">
            Bekleme Odasında
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {inWaitingRoom.length}
          </div>
          <span className="text-[11px] text-(--color-text-secondary) mt-1 block">
            Ödemesi Yapılmış Hasta
          </span>
        </Card>

        <Card padding="md" className="border border-(--color-border-subtle) bg-white">
          <span className="text-[11px] font-semibold text-(--color-text-muted) uppercase block">
            Koltukta / Muayenede
          </span>
          <div className="text-2xl font-black text-(--color-primary) font-mono mt-1">
            {inChair.length}
          </div>
          <span className="text-[11px] text-(--color-text-secondary) mt-1 block">
            İşlemi Devam Eden
          </span>
        </Card>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: ÖNCELİKLİ KASA TAHSİLAT MASASI (QR OKUTANLAR & EK İŞLEMLER) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-(--color-text-primary)">
              Kasa Tahsilat Masası (Gelen & Ödeme Bekleyen Hastalar)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold font-mono">
              {needingPayment.length} Hasta
            </span>
          </div>
          <button
            onClick={loadData}
            title="Listeyi Yenile"
            className="min-h-[36px] px-2 text-xs font-semibold text-(--color-text-secondary) hover:text-(--color-primary) flex items-center gap-1.5 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            Canlı <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {needingPayment.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-(--color-border-subtle) text-center text-xs text-(--color-text-muted)">
            Şu an bankoda ödeme bekleyen hasta bulunmamaktadır.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {needingPayment.map((apt) => {
              const isChairside = apt.status === 'awaiting_chairside_payment';
              return (
                <div
                  key={apt.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isChairside
                      ? 'bg-red-50/70 border-red-300 shadow-md ring-2 ring-red-400'
                      : 'bg-orange-50/70 border-orange-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-black/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {apt.patientName}
                        </span>
                        {apt.isEarlyArrival && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                            Erken Geldi
                          </span>
                        )}
                        {isChairside && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold flex items-center gap-1">
                            <Zap size={10} /> Çıkış Tahsilatı
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" /> {apt.patientPhone}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Randevu Saati</span>
                      <span className="text-xs font-bold font-mono text-slate-800">
                        {apt.startTime.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* Doctor & Fee info */}
                  <div className="my-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">İlgili Hekim:</span>
                      <span className="font-semibold text-slate-800">
                        {apt.doctorTitle} {apt.doctorName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">{apt.feeTitle}</span>
                      <span className="text-lg font-black text-slate-900 font-mono">
                        {Number(apt.expectedFee).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>

                  {isChairside && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-100 text-[11px] font-bold text-red-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Doktor muayene odasında koltukta ek işlem uygulandı. Çıkışta tahsilat yapınız!</span>
                    </div>
                  )}

                  {/* Payment Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      onClick={() =>
                        handleCollectPayment(apt.id, 'pos', isChairside)
                      }
                      variant="primary"
                      size="sm"
                      className="justify-center text-xs font-bold"
                      disabled={processingId === apt.id}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      POS Slip Çekildi
                    </Button>

                    <Button
                      onClick={() =>
                        handleCollectPayment(apt.id, 'cash', isChairside)
                      }
                      variant="outline"
                      size="sm"
                      className="justify-center text-xs font-bold bg-white"
                      disabled={processingId === apt.id}
                    >
                      <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Nakit Tahsil Edildi
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: GÜNÜN TÜM RANDEVULARI & DİREKT SEANS ATAMA (FAZ 4.4) */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-bold text-(--color-text-primary)">
          Bugünkü Randevu Akışı & Banko Yönetimi ({data.todayAppointments.length} Randevu)
        </h2>

        <div className="bg-white rounded-2xl border border-(--color-border-subtle) overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-(--color-bg-elevated) text-(--color-text-secondary) border-b border-(--color-border-subtle) font-semibold">
                <tr>
                  <th className="py-3 px-4">Saat</th>
                  <th className="py-3 px-4">Hasta Adı & Tel</th>
                  <th className="py-3 px-4">Hekim & Branş</th>
                  <th className="py-3 px-4">İşlem & Ücret</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">Banko Aksiyonu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border-subtle)">
                {data.todayAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-(--color-bg-elevated)/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-(--color-text-primary)">
                      {apt.startTime.slice(0, 5)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-(--color-text-primary)">
                        {apt.patientName}
                      </div>
                      <span className="text-[11px] text-(--color-text-muted) font-mono">
                        {apt.patientPhone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-(--color-text-primary)">
                        {apt.doctorTitle} {apt.doctorName}
                      </div>
                      <span className="text-[11px] text-(--color-text-muted)">
                        {apt.doctorBranch}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-(--color-text-primary)">
                        {apt.feeTitle}
                      </div>
                      <span className="text-[11px] font-mono text-(--color-primary) font-bold">
                        {Number(apt.expectedFee).toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={apt.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Direkt Seans Randevusu Atama Butonu (Faz 4.4) — yalnızca muayeneye girmiş hastalar */}
                        {['in_chair', 'awaiting_chairside_payment', 'completed'].includes(apt.status) && (
                        <Button
                          onClick={() =>
                            setSessionPatient({
                              id: apt.patientId,
                              name: apt.patientName,
                              phone: apt.patientPhone,
                              defaultDoctorId: apt.doctorId,
                            })
                          }
                          variant="secondary"
                          size="xs"
                          className="min-h-[36px] px-3 text-xs font-semibold"
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Seans Randevula
                        </Button>
                        )}

                        {/* Manuel Check-in if patient arrived without smartphone */}
                        {apt.status === 'confirmed' && (
                          <Button
                            onClick={() => handleManualCheckin(apt.id)}
                            variant="outline"
                            size="xs"
                            className="min-h-[36px] px-3 text-xs font-semibold"
                            disabled={processingId === apt.id}
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1 text-(--color-primary)" />
                            Manuel Geldi
                          </Button>
                        )}

                        {/* Randevu saati geçmiş ve gelmemiş hasta */}
                        {apt.status === 'confirmed' && minutesUntilAppointment(apt.date, apt.startTime) <= 0 && (
                          <Button
                            onClick={() => setNoShowTarget({ id: apt.id, name: apt.patientName })}
                            variant="outline"
                            size="xs"
                            className="min-h-[36px] px-3 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
                            disabled={processingId === apt.id}
                          >
                            Gelmedi
                          </Button>
                        )}

                        {/* Reset Patient PIN button */}
                        <button
                          type="button"
                          onClick={() => setPinTarget({ id: apt.patientId, name: apt.patientName })}
                          title="Hastanın 4 haneli PIN kodunu sıfırla"
                          className="min-h-[36px] px-2.5 py-1.5 rounded-xl text-xs font-medium text-(--color-text-secondary) hover:text-(--color-primary) hover:bg-(--color-bg-elevated) transition-colors inline-flex items-center gap-1.5 border border-(--color-border-subtle) cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-(--color-primary)" />
                          <span className="hidden sm:inline">PIN Sıfırla</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SessionBookingModal
        patient={sessionPatient}
        onClose={() => setSessionPatient(null)}
        onBooked={(text) => {
          setMessage({ type: 'success', text });
          loadData();
        }}
      />

      <ConfirmDialog
        isOpen={!!pinTarget}
        title="PIN Sıfırla"
        message={pinTarget && <><strong>{pinTarget.name}</strong> hastasının PIN kodu silinecek, varsa giriş kilidi kalkacak. Hasta bir sonraki girişinde yeni PIN belirler. Kimliğini teyit ettiğinizden emin olun.</>}
        confirmLabel="PIN'i Sıfırla"
        onConfirm={confirmResetPin}
        onClose={() => setPinTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!noShowTarget}
        title="Gelmedi Olarak İşaretle"
        danger
        message={noShowTarget && <><strong>{noShowTarget.name}</strong> randevusuna gelmedi olarak kaydedilecek ve hastaya bildirim gidecek. Seans randevusuysa tedavi adımı yeniden planlanabilir hale gelir.</>}
        confirmLabel="Gelmedi"
        onConfirm={confirmNoShow}
        onClose={() => setNoShowTarget(null)}
      />
    </div>
  );
}
