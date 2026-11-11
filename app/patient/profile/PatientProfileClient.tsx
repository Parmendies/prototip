'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Modal } from '@/app/_components/ui/Modal';
import { Phone, KeyRound, LogOut, Check, AlertCircle, ShieldCheck, Heart } from 'lucide-react';
import { updatePatientPinAction } from './actions';
import { logoutPatientAction } from '@/app/(auth)/giris/actions';

export default function PatientProfileClient({ patient }: { patient: any }) {
  const router = useRouter();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (newPin !== confirmPin) {
      setPinMessage({ type: 'error', text: 'Girdiğiniz PIN kodları birbiriyle eşleşmiyor.' });
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setPinMessage({ type: 'error', text: 'PIN kodu 4 haneli bir sayı olmalıdır.' });
      return;
    }

    setSavingPin(true);
    try {
      const res = await updatePatientPinAction(newPin);
      if (res.success) {
        setPinMessage({ type: 'success', text: '4 Haneli PIN kodunuz başarıyla güncellendi!' });
        setNewPin('');
        setConfirmPin('');
      } else {
        setPinMessage({ type: 'error', text: res.error || 'PIN güncellenemedi.' });
      }
    } finally {
      setSavingPin(false);
    }
  };

  const handleLogout = async () => {
    await logoutPatientAction();
    router.push('/giris');
    router.refresh();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Header Profile Card */}
      <Card padding="md" className="text-center bg-white border border-(--color-border-subtle) shadow-xs">
        <Avatar firstName={patient.firstName} lastName={patient.lastName} size="xl" className="mx-auto mb-3 shadow-xs" />
        <h1 className="text-base sm:text-lg font-bold text-(--color-text-primary)">
          {patient.firstName} {patient.lastName}
        </h1>
        <p className="text-xs text-(--color-text-secondary) font-mono mt-0.5 font-medium">{patient.phone}</p>

        {patient.tcIdentityNo && (
          <p className="text-[11px] text-(--color-text-muted) font-mono mt-1">
            TC Kimlik: {patient.tcIdentityNo}
          </p>
        )}

        {patient.medicalAlertNote && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-950 text-xs font-semibold flex items-center justify-center gap-2 border border-red-200">
            <Heart size={15} className="text-red-600 shrink-0" />
            <span>Tıbbi Not / Alerji: {patient.medicalAlertNote}</span>
          </div>
        )}
      </Card>

      {/* Change PIN Card */}
      <Card padding="md" className="bg-white border border-(--color-border-subtle) shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-(--color-border-subtle)">
          <div className="w-8 h-8 rounded-xl bg-(--color-primary-muted) text-(--color-primary) flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-(--color-text-primary)">
              4 Haneli Kişisel PIN Kodunu Değiştir
            </h2>
          </div>
        </div>

        <p className="text-xs text-(--color-text-secondary) mb-4 leading-relaxed font-normal">
          Sisteme sonraki girişlerinizde ve kiosk QR check-in ekranında kullanacağınız 4 haneli şifrenizi buradan yenileyebilirsiniz.
        </p>

        {pinMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              pinMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            {pinMessage.type === 'success' ? <Check size={15} className="text-emerald-700 shrink-0" /> : <AlertCircle size={15} className="text-red-700 shrink-0" />}
            <span>{pinMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePin} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">Yeni PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full min-h-[48px] px-3 py-2 text-center text-xl tracking-widest font-mono font-bold rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-(--color-text-secondary) mb-1.5">Yeni PIN (Tekrar)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full min-h-[48px] px-3 py-2 text-center text-xl tracking-widest font-mono font-bold rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full justify-center min-h-[44px] text-xs font-bold shadow-(--shadow-primary-soft)"
            disabled={savingPin || newPin.length !== 4 || confirmPin.length !== 4}
          >
            {savingPin ? 'Güncelleniyor...' : 'PIN Kodunu Güncelle'}
          </Button>
        </form>
      </Card>

      {/* Logout - Safe Action with Confirmation Dialog */}
      <Card padding="md" className="bg-white border border-(--color-border-subtle) shadow-xs">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-200"
        >
          <LogOut size={15} />
          <span>Oturumu Kapat</span>
        </button>
      </Card>

      {/* Logout Confirmation Dialog */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Oturumu Kapat"
        subtitle="Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
        size="sm"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutModal(false)}
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
          Oturumunuz kapatıldığında randevularınızı ve profilinizi görüntülemek için telefon numaranızla yeniden giriş yapmanız gerekecektir.
        </p>
      </Modal>
    </div>
  );
}

