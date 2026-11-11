'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPatientDashboardData, logoutAction, cancelMyAppointmentAction } from './actions';
import { ConfirmDialog } from '@/app/_components/ui/ConfirmDialog';
import { useLiveUpdates } from '@/app/_lib/useLiveUpdates';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Tabs } from '@/app/_components/ui/Tabs';
import { Modal } from '@/app/_components/ui/Modal';
import {
  Calendar,
  Clock,
  Plus,
  QrCode,
  FileText,
  Pill,
  Bell,
  BellOff,
  LogOut,
  CheckCircle2,
  CreditCard,
  User,
  CalendarCheck2,
  CalendarX,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

const STEP_STATUS: Record<string, { label: string; cls: string }> = {
  planned: { label: 'Randevu bekliyor', cls: 'text-amber-700' },
  scheduled: { label: 'Randevu verildi', cls: 'text-(--color-primary)' },
  awaiting_payment: { label: 'Ödeme bekliyor', cls: 'text-red-700' },
  paid: { label: '✓ Ödendi', cls: 'text-emerald-700' },
  completed: { label: '✓ Tamamlandı', cls: 'text-emerald-700' },
};

export default function PatientDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Awaited<ReturnType<typeof getPatientDashboardData>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('appointments');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; label: string } | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await getPatientDashboardData();
      setData(res);
    } catch {
      router.push('/giris');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Onay, ödeme, hekim çağrısı, plan/reçete bildirimleri anında yansır
  useLiveUpdates([data ? `patient-${data.patient.id}` : null], loadData, 60_000);

  async function confirmCancel() {
    if (!cancelTarget) return;
    const res = await cancelMyAppointmentAction(cancelTarget.id);
    setNotice(res.success ? { type: 'success', text: 'Randevunuz iptal edildi.' } : { type: 'error', text: res.error || 'İptal edilemedi.' });
    setCancelTarget(null);
    await loadData();
  }

  async function handleLogout() {
    await logoutAction();
    router.push('/giris');
  }

  function getInitials(name: string) {
    if (!name) return 'H';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--color-bg-base) flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
          <p className="text-xs font-medium text-(--color-text-secondary)">Hasta dosyası yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const latestAppointment = data.nextAppointment;
  const patientInitials = getInitials(data.patient.name);

  return (
    <div className="min-h-screen w-full min-w-0 bg-(--color-bg-base)">
      {/* 1. TOP HEADER */}
      <header className="bg-white border-b border-(--color-border-subtle) px-3 py-2.5 sticky top-0 z-20 shadow-xs w-full">
        <div className="flex items-center justify-between gap-2 max-w-full">
          {/* User info: Initials avatar + Name + Darker readable phone */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-(--color-primary-muted) text-(--color-primary) border border-(--color-primary)/25 font-bold text-xs flex items-center justify-center shrink-0 select-none shadow-xs"
              title={data.patient.name}
            >
              {patientInitials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-(--color-text-primary) block leading-tight truncate">
                {data.patient.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium text-(--color-text-secondary) block mt-0.5 truncate">
                {data.patient.phone}
              </span>
            </div>
          </div>

          {/* Action buttons: Prominent Primary QR Button + Profile + Separated Logout */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/checkin"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 shrink-0" />
              <span>Check-in</span>
            </Link>

            <Link
              href="/patient/profile"
              title="Profilim ve PIN Değiştir"
              aria-label="Profilim"
              className="w-11 h-11 rounded-xl text-(--color-text-secondary) hover:text-(--color-primary) hover:bg-(--color-bg-elevated) transition-colors inline-flex items-center justify-center"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Separated Logout button to prevent accidental clicks */}
            <div className="border-l border-(--color-border-subtle) pl-1 ml-0.5">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Çıkış Yap"
                aria-label="Çıkış Yap"
                className="w-11 h-11 rounded-xl text-(--color-text-muted) hover:text-red-600 hover:bg-red-50 transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal using Common Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Oturumu Kapat"
        subtitle="Çıkış yapmak istediğinize emin misiniz?"
        size="sm"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
            >
              Çıkış Yap
            </Button>
          </div>
        }
      >
        <p className="text-xs text-(--color-text-secondary) leading-relaxed">
          Oturumunuz kapatıldığında randevularınızı ve tedavi planınızı görüntülemek için telefon numaranız ve 4 haneli PIN&apos;inizle yeniden giriş yapmanız gerekecektir.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Randevuyu İptal Et"
        danger
        confirmLabel="İptal Et"
        cancelLabel="Vazgeç"
        message={cancelTarget && <><strong>{cancelTarget.label}</strong> randevunuz iptal edilecek. Bu işlem geri alınamaz.</>}
        onConfirm={confirmCancel}
        onClose={() => setCancelTarget(null)}
      />

      <main className="px-3.5 pt-3.5 space-y-3.5 w-full min-w-0">
        {/* Medical Alert Warning if present */}
        {data.patient.medicalAlert && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-red-950">Tıbbi Uyarı:</strong> {data.patient.medicalAlert}
            </div>
          </div>
        )}

        {notice && (
          <div
            role={notice.type === 'error' ? 'alert' : 'status'}
            className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between gap-2 ${
              notice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} aria-label="Kapat" className="w-8 h-8 cursor-pointer">✕</button>
          </div>
        )}

        {/* 2. ACTIVE APPOINTMENT OR BALANCED EMPTY STATE */}
        {latestAppointment ? (
          <Card padding="md" className="border border-(--color-border-subtle) shadow-xs bg-white rounded-2xl w-full">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-(--color-border-subtle)">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-(--color-primary) uppercase tracking-wider block">
                  En Yakın Randevunuz
                </span>
                <h2 className="text-sm font-bold text-(--color-text-primary) mt-0.5 truncate">
                  {latestAppointment.doctorTitle} {latestAppointment.doctorName}
                </h2>
                <p className="text-xs text-(--color-text-secondary) truncate">
                  {latestAppointment.doctorBranch}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-(--color-bg-elevated) text-(--color-text-primary) border border-(--color-border-subtle) block mb-0.5">
                  {latestAppointment.date}
                </span>
                <span className="text-xs font-mono font-semibold text-(--color-primary)">
                  {latestAppointment.startTime.slice(0, 5)}
                </span>
              </div>
            </div>

            {/* Status Guidance */}
            <div className="mt-2.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <span className="text-(--color-text-secondary) font-bold text-xs">Randevu Durumu:</span>
                <Badge status={latestAppointment.status} size="sm" />
              </div>

              {/* Action according to status */}
              {latestAppointment.status === 'pending_approval' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Talebiniz inceleniyor.</strong> Sekreterimiz sizi arayıp saati teyit edecek; gerekirse saat değiştirilerek onaylanabilir.
                  </div>
                </div>
              )}

              {latestAppointment.status === 'confirmed' && (
                <p className="p-3 rounded-xl bg-(--color-primary-muted) text-xs text-(--color-text-primary) leading-relaxed flex items-start gap-2.5">
                  <QrCode className="w-4 h-4 text-(--color-primary) shrink-0 mt-0.5" />
                  <span>
                    Randevu günü kliniğe geldiğinizde <strong>danışmadaki QR kodu</strong> telefonunuzun kamerasıyla okutarak giriş yapın.
                  </span>
                </p>
              )}

              {(latestAppointment.status === 'checked_in_unpaid' || latestAppointment.status === 'awaiting_chairside_payment') && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>{latestAppointment.status === 'checked_in_unpaid' ? 'Girişiniz alındı.' : 'Çıkışta ödeme bekleniyor.'}</strong>{' '}
                    Lütfen bankoda
                    {latestAppointment.dueAmount != null && (
                      <>
                        {' '}
                        <span className="font-bold font-mono">{latestAppointment.dueAmount.toLocaleString('tr-TR')} ₺</span>
                        {latestAppointment.dueTitle ? ` (${latestAppointment.dueTitle})` : ''}
                      </>
                    )}{' '}
                    ödemenizi yapınız.
                  </div>
                </div>
              )}

              {latestAppointment.status === 'in_chair' && (
                <div className="p-3 rounded-xl bg-(--color-primary-muted) border border-(--color-primary)/30 text-xs text-(--color-text-primary) flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-(--color-primary) shrink-0 mt-0.5" />
                  <div className="leading-relaxed"><strong>Muayenedesiniz.</strong> Hekiminiz sizi içeri aldı.</div>
                </div>
              )}

              {latestAppointment.status === 'waiting_room' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Ödemeniz onaylandı.</strong> Sıranız geldiğinde hekiminiz sizi içeri çağıracaktır.
                  </div>
                </div>
              )}

              {latestAppointment.canCancel && (
                <button
                  type="button"
                  onClick={() =>
                    setCancelTarget({
                      id: latestAppointment.id,
                      label: `${latestAppointment.date} ${latestAppointment.startTime.slice(0, 5)} — ${latestAppointment.doctorTitle} ${latestAppointment.doctorName}`,
                    })
                  }
                  className="w-full min-h-[44px] rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer"
                >
                  Randevuyu İptal Et
                </button>
              )}
            </div>
          </Card>
        ) : (
          /* BALANCED & TIGHT EMPTY STATE CARD */
          <Card padding="md" className="text-center bg-white border border-(--color-border-subtle) rounded-2xl shadow-xs py-5 w-full">
            <div className="w-10 h-10 rounded-2xl bg-(--color-primary-muted) text-(--color-primary) flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-(--color-text-primary)">
              Aktif Randevunuz Yok
            </h3>
            <p className="text-xs text-(--color-text-secondary) mt-1 mb-4 max-w-xs mx-auto leading-relaxed">
              Hekim takviminden dilediğiniz saati seçerek anında randevu ön talebi oluşturabilirsiniz.
            </p>
            <Link
              href="/patient/book"
              className="inline-flex items-center justify-center gap-1 min-h-[44px] px-4 rounded-xl bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Randevu Al</span>
            </Link>
          </Card>
        )}

        {/* 3. KLİNİK KAYITLARIM SECTION & TABS */}
        <div className="space-y-2 pt-1 w-full min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-(--color-text-primary)">
              Klinik Kayıtlarım
            </h2>

            {/* Show secondary quick button ONLY if an active appointment already exists (avoids duplicate CTA) */}
            {latestAppointment && (
              <Link
                href="/patient/book"
                className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-xl bg-(--color-primary-muted) text-(--color-primary) border border-(--color-primary)/20 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Randevu</span>
              </Link>
            )}
          </div>

          {/* Standardized Tabs with Icon & Auto-Hidden Zero Count */}
          <Tabs
            tabs={[
              { id: 'appointments', label: 'Randevularım', icon: <CalendarCheck2 className="w-4 h-4" />, badge: data.appointments.length },
              { id: 'plans', label: 'Tedavi Planım', icon: <FileText className="w-4 h-4" />, badge: data.treatmentPlans.length },
              { id: 'prescriptions', label: 'E-Reçeteler', icon: <Pill className="w-4 h-4" />, badge: data.prescriptions.length },
              { id: 'notifications', label: 'Bildirimler', icon: <Bell className="w-4 h-4" />, badge: data.notifications.length },
            ]}
            defaultTab={activeTab}
            onChange={(id) => setActiveTab(id)}
            variant="underline"
            className="w-full"
          />
        </div>

        {/* 4. DEDICATED EMPTY STATES & CONTENT CARDS */}

        {/* TAB 1: RANDEVULARIM */}
        {activeTab === 'appointments' && (
          <div className="space-y-2 w-full min-w-0">
            {data.appointments.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-(--color-border-subtle) space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-(--color-bg-elevated) text-(--color-text-muted) flex items-center justify-center mx-auto">
                  <CalendarX className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-(--color-text-primary)">Kayıtlı Randevu Bulunmuyor</h4>
                <p className="text-[11px] text-(--color-text-secondary) max-w-xs mx-auto leading-relaxed">
                  Geçmiş ve yaklaşan tüm randevularınızın kayıtları bu alanda listelenecektir.
                </p>
                <div className="pt-1.5">
                  <Link
                    href="/patient/book"
                    className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-xl bg-(--color-primary-muted) text-(--color-primary) hover:bg-(--color-primary) hover:text-white text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Hemen Randevu Al</span>
                  </Link>
                </div>
              </div>
            ) : (
              data.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-2xl bg-white border border-(--color-border-subtle) text-xs space-y-1.5 shadow-2xs hover:border-(--color-primary)/40 transition-colors w-full"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-(--color-text-primary) block truncate">
                        {apt.doctorTitle} {apt.doctorName}
                      </span>
                      <span className="text-(--color-text-secondary) block text-[11px] truncate">
                        {apt.doctorBranch}
                      </span>
                    </div>
                    <Badge status={apt.status} size="xs" className="shrink-0" />
                  </div>

                  <div className="flex items-center gap-3 text-(--color-text-secondary) pt-1 text-[11px] border-t border-slate-100">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Calendar className="w-3.5 h-3.5 text-(--color-primary)" /> {apt.date}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-(--color-primary)" /> {apt.startTime.slice(0, 5)}
                    </span>
                    {apt.canCancel && (
                      <button
                        type="button"
                        onClick={() =>
                          setCancelTarget({
                            id: apt.id,
                            label: `${apt.date} ${apt.startTime.slice(0, 5)} — ${apt.doctorTitle} ${apt.doctorName}`,
                          })
                        }
                        className="ml-auto min-h-[32px] px-2.5 rounded-lg text-[11px] font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        İptal Et
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: TEDAVİ PLANIM & SEANSLAR */}
        {activeTab === 'plans' && (
          <div className="space-y-2.5 w-full min-w-0">
            {data.treatmentPlans.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-(--color-border-subtle) space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-(--color-bg-elevated) text-(--color-text-muted) flex items-center justify-center mx-auto">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-(--color-text-primary)">Tedavi Planı Oluşturulmadı</h4>
                <p className="text-[11px] text-(--color-text-secondary) max-w-xs mx-auto leading-relaxed">
                  Muayenenizin ardından diş hekiminizin belirleyeceği seans adımları ve tahmini işlem ücretleri bu alana yansıyacaktır.
                </p>
              </div>
            ) : (
              data.treatmentPlans.map((plan) => (
                <Card key={plan.id} padding="md" className="space-y-2.5 bg-white border border-(--color-border-subtle) rounded-2xl shadow-xs w-full">
                  <div className="flex justify-between items-center pb-2 border-b border-(--color-border-subtle)">
                    <span className="font-bold text-xs text-(--color-text-primary) truncate">
                      Planlayan: {plan.doctorTitle} {plan.doctorName}
                    </span>
                    <span className="text-[10px] font-mono text-(--color-text-secondary) shrink-0">
                      {new Date(plan.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  {plan.doctorSummaryNote && (
                    <p className="text-xs text-(--color-text-secondary) italic bg-(--color-bg-elevated) p-2.5 rounded-xl border border-(--color-border-subtle)">
                      &ldquo;{plan.doctorSummaryNote}&rdquo;
                    </p>
                  )}

                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-wider block">
                      Seans Adımları & Ücretleri
                    </span>
                    {plan.steps.map((step) => (
                      <div
                        key={step.id}
                        className="p-2.5 rounded-xl bg-(--color-bg-elevated) flex items-center justify-between text-xs border border-(--color-border-subtle) gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-(--color-text-primary) block truncate">
                            {step.stepOrder}. Adım: {step.title}
                          </span>
                          {step.fdiNumber && (
                            <span className="text-[10px] text-(--color-primary) font-mono font-semibold">
                              İlgili Diş: #{step.fdiNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <span className="font-bold font-mono text-(--color-text-primary) block text-xs">
                            {Number(step.price).toLocaleString('tr-TR')} ₺
                          </span>
                          <span className={`text-[10px] uppercase font-bold block ${STEP_STATUS[step.status]?.cls ?? 'text-amber-700'}`}>
                            {STEP_STATUS[step.status]?.label ?? step.status}
                          </span>
                          {plan.status === 'active' && step.status === 'planned' && step.executionMode === 'scheduled_session' && (
                            <Link
                              href={`/patient/book?step=${step.id}`}
                              className="inline-flex items-center justify-center min-h-[32px] px-2.5 rounded-lg bg-(--color-primary) text-white text-[11px] font-bold"
                            >
                              Seans Talep Et
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 3: E-REÇETELER */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-2.5 w-full min-w-0">
            {data.prescriptions.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-(--color-border-subtle) space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-(--color-bg-elevated) text-(--color-text-muted) flex items-center justify-center mx-auto">
                  <Pill className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-(--color-text-primary)">Kayıtlı E-Reçete Yok</h4>
                <p className="text-[11px] text-(--color-text-secondary) max-w-xs mx-auto leading-relaxed">
                  Hekiminizin düzenlediği Sağlık Bakanlığı Medula e-reçete kodları ve ilaç kullanım tarifleri burada yer alır.
                </p>
              </div>
            ) : (
              data.prescriptions.map((p) => (
                <Card key={p.id} padding="md" className="space-y-2.5 bg-white border border-(--color-border-subtle) rounded-2xl shadow-xs w-full">
                  <div className="flex justify-between items-center pb-2 border-b border-(--color-border-subtle) gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-(--color-primary) truncate">
                      <Pill className="w-4 h-4 shrink-0" />
                      <span className="truncate">E-Reçete No: <span className="font-mono">{p.medulaErefNo}</span></span>
                    </div>
                    <span className="text-[10px] font-mono text-(--color-text-secondary) shrink-0">
                      {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {p.medications.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-(--color-bg-elevated) text-xs border border-(--color-border-subtle)">
                        <span className="font-bold text-(--color-text-primary) block">{m.name}</span>
                        <span className="text-[11px] text-(--color-text-secondary) block mt-0.5">
                          Dozaj: <strong className="font-medium text-(--color-text-primary)">{m.dosage}</strong> — Kullanım: <strong className="font-medium text-(--color-text-primary)">{m.frequency}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 4: BİLDİRİMLER */}
        {activeTab === 'notifications' && (
          <div className="space-y-2 w-full min-w-0">
            {data.notifications.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-(--color-border-subtle) space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-(--color-bg-elevated) text-(--color-text-muted) flex items-center justify-center mx-auto">
                  <BellOff className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-(--color-text-primary)">Yeni Bildiriminiz Yok</h4>
                <p className="text-[11px] text-(--color-text-secondary) max-w-xs mx-auto leading-relaxed">
                  Randevu onayları, bekleme odası durumu ve klinik bilgilendirmeleri anlık olarak buraya iletilir.
                </p>
              </div>
            ) : (
              data.notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-2xl bg-white border border-(--color-border-subtle) text-xs shadow-2xs space-y-1 w-full">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-(--color-text-primary) truncate">{n.title}</span>
                    <span className="text-[10px] font-mono text-(--color-text-muted) shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-(--color-text-secondary) text-[11px] leading-relaxed">
                    {n.body}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
