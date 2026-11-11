'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  searchPatientsAction,
  getRecentPatientsAction,
  createPatientAction,
  bookPhoneAppointmentAction,
  getPatientAppointmentsAction,
} from './actions';
import { getDoctorSlotsForDeskAction, getDoctorsListAction, resetPatientPinAction } from '../desk/actions';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Modal } from '@/app/_components/ui/Modal';
import { ConfirmDialog } from '@/app/_components/ui/ConfirmDialog';
import { SlotPicker, type DoctorOption } from '../_components/SlotPicker';
import { SessionBookingModal, type SessionPatient } from '../_components/SessionBookingModal';
import { clinicToday } from '@/lib/time';
import { Search, UserPlus, KeyRound, CalendarPlus, Calendar, Lock, ShieldAlert, Phone } from 'lucide-react';

type PatientRow = Awaited<ReturnType<typeof searchPatientsAction>>[number];
type UpcomingRow = Awaited<ReturnType<typeof getPatientAppointmentsAction>>[number];

const inputCls =
  'w-full min-h-[44px] px-3.5 text-sm rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)';

export default function SecretaryPatientsPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selected, setSelected] = useState<PatientRow | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  // Yeni hasta
  const [showRegister, setShowRegister] = useState(false);
  const [reg, setReg] = useState({ firstName: '', lastName: '', phone: '', tcIdentityNo: '', birthDate: '', medicalAlertNote: '' });
  const [regError, setRegError] = useState<string | null>(null);
  const [regSaving, setRegSaving] = useState(false);

  // Telefonla randevu
  const [bookFor, setBookFor] = useState<PatientRow | null>(null);
  const [bDoctor, setBDoctor] = useState('');
  const [bDate, setBDate] = useState(clinicToday());
  const [bTime, setBTime] = useState('');
  const [bComplaint, setBComplaint] = useState('');
  const [bError, setBError] = useState<string | null>(null);
  const [bRefresh, setBRefresh] = useState(0);

  const [pinTarget, setPinTarget] = useState<PatientRow | null>(null);
  const [sessionPatient, setSessionPatient] = useState<SessionPatient | null>(null);

  useEffect(() => {
    getDoctorsListAction().then(setDoctors).catch(() => {});
  }, []);

  const runSearch = useCallback(async (q: string) => {
    setSearching(true);
    try {
      setResults(q.trim().length >= 2 ? await searchPatientsAction(q) : await getRecentPatientsAction());
    } catch {
      setMessage({ type: 'error', text: 'Arama yapılamadı.' });
    } finally {
      setSearching(false);
    }
  }, []);

  // Yazarken 300 ms gecikmeli arama
  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  async function selectPatient(p: PatientRow) {
    setSelected(p);
    setUpcoming([]);
    try {
      setUpcoming(await getPatientAppointmentsAction(p.id));
    } catch {
      // yoksay
    }
  }

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegSaving(true);
    setRegError(null);
    try {
      const res = await createPatientAction(reg);
      if (!res.success) {
        setRegError(res.error);
        return;
      }
      setShowRegister(false);
      setMessage({ type: 'success', text: `${reg.firstName} ${reg.lastName} kaydedildi. Hasta ilk girişinde kendi PIN'ini belirleyecek.` });
      setReg({ firstName: '', lastName: '', phone: '', tcIdentityNo: '', birthDate: '', medicalAlertNote: '' });
      const found = await searchPatientsAction(reg.phone.replace(/\D/g, '').slice(-10));
      setResults(found);
      if (found[0]) selectPatient(found[0]);
    } finally {
      setRegSaving(false);
    }
  }

  function openBooking(p: PatientRow) {
    setBookFor(p);
    setBDoctor(doctors[0]?.id ?? '');
    setBDate(clinicToday());
    setBTime('');
    setBComplaint('');
    setBError(null);
  }

  async function submitBooking() {
    if (!bookFor) return;
    if (!bTime) {
      setBError('Lütfen bir saat seçiniz.');
      return;
    }
    const res = await bookPhoneAppointmentAction({
      patientId: bookFor.id,
      doctorId: bDoctor,
      date: bDate,
      startTime: bTime,
      complaintText: bComplaint,
    });
    if (!res.success) {
      setBError(res.error);
      setBTime('');
      setBRefresh((n) => n + 1);
      return;
    }
    setMessage({ type: 'success', text: `${bookFor.firstName} ${bookFor.lastName} için ${bDate} ${bTime} randevusu onaylı olarak oluşturuldu.` });
    if (selected?.id === bookFor.id) selectPatient(bookFor);
    setBookFor(null);
  }

  async function confirmResetPin() {
    if (!pinTarget) return;
    const res = await resetPatientPinAction(pinTarget.id);
    setMessage(
      res.success
        ? { type: 'success', text: `${pinTarget.firstName} ${pinTarget.lastName} PIN'i sıfırlandı; hasta yeni PIN belirleyebilir.` }
        : { type: 'error', text: res.error || 'PIN sıfırlanamadı.' }
    );
    setPinTarget(null);
    runSearch(query);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-(--color-border-subtle)">
        <div>
          <h1 className="text-xl font-bold text-(--color-text-primary)">Hasta Kayıtları</h1>
          <p className="text-xs text-(--color-text-secondary) mt-0.5">
            Telefonla arayan hastaya randevu verin, yeni hasta kaydedin, PIN sıfırlayın.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowRegister(true)} icon={<UserPlus className="w-4 h-4" />}>
          Yeni Hasta
        </Button>
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

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-text-muted)" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad soyad, telefon veya TC ile ara…"
          className={`${inputCls} pl-10`}
          aria-label="Hasta ara"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[11px] font-semibold text-(--color-text-muted) uppercase">
            {query.trim().length >= 2 ? `Arama sonuçları${searching ? '…' : ` (${results.length})`}` : 'Son kaydedilen hastalar'}
          </p>
          {!searching && results.length === 0 && (
            <div className="p-6 rounded-2xl bg-white border border-(--color-border-subtle) text-center text-xs text-(--color-text-secondary) space-y-3">
              <p>Eşleşen hasta bulunamadı.</p>
              <Button variant="secondary" size="sm" onClick={() => setShowRegister(true)}>
                Yeni hasta olarak kaydet
              </Button>
            </div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPatient(p)}
              className={`w-full text-left p-3 rounded-2xl border bg-white flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                selected?.id === p.id ? 'border-(--color-primary) ring-2 ring-(--color-primary)/20' : 'border-(--color-border-subtle) hover:border-(--color-primary)/50'
              }`}
            >
              <div className="min-w-0">
                <span className="text-sm font-bold text-(--color-text-primary) block truncate">
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-xs font-mono text-(--color-text-secondary)">{p.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {p.medicalAlertNote && <ShieldAlert className="w-4 h-4 text-red-600" aria-label="Tıbbi uyarı var" />}
                {p.isLocked && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Kilitli
                  </span>
                )}
                {!p.hasPin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">PIN yok</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card padding="md" className="bg-white border border-(--color-border-subtle) space-y-4 lg:sticky lg:top-24">
              <div>
                <h2 className="text-base font-bold text-(--color-text-primary)">
                  {selected.firstName} {selected.lastName}
                </h2>
                <a href={`tel:${selected.phone}`} className="text-xs font-mono font-bold text-(--color-primary) inline-flex items-center gap-1 min-h-[32px]">
                  <Phone className="w-3.5 h-3.5" /> {selected.phone}
                </a>
                {selected.medicalAlertNote && (
                  <p className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
                    <strong>Tıbbi uyarı:</strong> {selected.medicalAlertNote}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button variant="primary" onClick={() => openBooking(selected)} icon={<CalendarPlus className="w-4 h-4" />}>
                  Muayene Randevusu Ver
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setSessionPatient({ id: selected.id, name: `${selected.firstName} ${selected.lastName}`, phone: selected.phone })
                  }
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Tedavi Seansı Randevula
                </Button>
                <Button variant="outline" onClick={() => setPinTarget(selected)} icon={<KeyRound className="w-4 h-4" />}>
                  {selected.isLocked ? 'Kilidi Kaldır & PIN Sıfırla' : 'PIN Sıfırla'}
                </Button>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-(--color-text-muted) uppercase mb-1.5">Yaklaşan randevular</p>
                {upcoming.length === 0 ? (
                  <p className="text-xs text-(--color-text-secondary)">Yaklaşan randevu yok.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {upcoming.map((a) => (
                      <li key={a.id} className="p-2.5 rounded-xl bg-(--color-bg-elevated) text-xs flex items-center justify-between gap-2">
                        <span>
                          <span className="font-mono font-bold">{a.date} {a.startTime.slice(0, 5)}</span>
                          <span className="block text-(--color-text-secondary)">{a.doctorTitle} {a.doctorName}</span>
                        </span>
                        <Badge status={a.status} size="xs" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-(--color-border-subtle) text-xs text-(--color-text-secondary) text-center">
              İşlem yapmak için listeden bir hasta seçin.
            </div>
          )}
        </div>
      </div>

      {/* Yeni hasta kaydı */}
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Yeni Hasta Kaydı" size="md">
        <form onSubmit={submitRegister} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Ad *</span>
              <input className={inputCls} value={reg.firstName} onChange={(e) => setReg({ ...reg, firstName: e.target.value })} required autoComplete="off" />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Soyad *</span>
              <input className={inputCls} value={reg.lastName} onChange={(e) => setReg({ ...reg, lastName: e.target.value })} required autoComplete="off" />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Cep Telefonu *</span>
            <input className={`${inputCls} font-mono`} type="tel" inputMode="tel" placeholder="05XX XXX XX XX" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">TC Kimlik No</span>
              <input className={`${inputCls} font-mono`} inputMode="numeric" maxLength={11} value={reg.tcIdentityNo} onChange={(e) => setReg({ ...reg, tcIdentityNo: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Doğum Tarihi</span>
              <input className={inputCls} type="date" value={reg.birthDate} onChange={(e) => setReg({ ...reg, birthDate: e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Tıbbi Uyarı (alerji, kronik hastalık…)</span>
            <input className={inputCls} value={reg.medicalAlertNote} onChange={(e) => setReg({ ...reg, medicalAlertNote: e.target.value })} />
          </label>
          {regError && <p role="alert" className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">{regError}</p>}
          <p className="text-[11px] text-(--color-text-muted)">PIN bankoda belirlenmez; hasta ilk girişinde kendi 4 haneli PIN&apos;ini oluşturur.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowRegister(false)}>Vazgeç</Button>
            <Button type="submit" variant="primary" loading={regSaving}>Kaydet</Button>
          </div>
        </form>
      </Modal>

      {/* Telefonla randevu */}
      <ConfirmDialog
        isOpen={!!bookFor}
        size="md"
        title="Muayene Randevusu Ver"
        message={bookFor && <>Randevu <strong>{bookFor.firstName} {bookFor.lastName}</strong> adına doğrudan onaylı oluşturulur.</>}
        confirmLabel="Randevuyu Oluştur"
        onConfirm={submitBooking}
        onClose={() => setBookFor(null)}
      >
        {bookFor && (
          <div className="mt-3 space-y-3">
            <SlotPicker
              doctors={doctors}
              doctorId={bDoctor}
              onDoctorChange={setBDoctor}
              date={bDate}
              onDateChange={setBDate}
              time={bTime}
              onTimeChange={setBTime}
              loadSlots={(docId, d) => getDoctorSlotsForDeskAction(docId, d)}
              refreshKey={bRefresh}
            />
            <label className="block">
              <span className="block text-xs font-bold text-(--color-text-secondary) mb-1">Şikayet / Not</span>
              <input className={inputCls} value={bComplaint} onChange={(e) => setBComplaint(e.target.value)} maxLength={1000} />
            </label>
            {bError && <p role="alert" className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">{bError}</p>}
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={!!pinTarget}
        title="PIN Sıfırla"
        message={pinTarget && <><strong>{pinTarget.firstName} {pinTarget.lastName}</strong> PIN&apos;i silinecek ve giriş kilidi kalkacak. Hastanın kimliğini teyit ettiğinizden emin olun.</>}
        confirmLabel="PIN'i Sıfırla"
        onConfirm={confirmResetPin}
        onClose={() => setPinTarget(null)}
      />

      <SessionBookingModal
        patient={sessionPatient}
        onClose={() => setSessionPatient(null)}
        onBooked={(text) => {
          setMessage({ type: 'success', text });
          if (selected) selectPatient(selected);
        }}
      />
    </div>
  );
}
