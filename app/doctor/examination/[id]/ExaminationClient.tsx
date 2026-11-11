'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { ConfirmDialog } from '@/app/_components/ui/ConfirmDialog';
import {
  saveToothCondition,
  addTreatmentPlanStep,
  deleteTreatmentPlanStep,
  savePrescriptionRecord,
  completeExaminationSession,
} from './actions';
import {
  ArrowLeft,
  Stethoscope,
  Sparkles,
  Phone,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  FileText,
  Pill,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

// FDI Tooth Condition Definitions
const CONDITIONS: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  healthy: {
    label: 'Sağlam',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    icon: '🟢',
  },
  caries: {
    label: 'Çürük',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-400 dark:border-rose-800',
    icon: '🔴',
  },
  filling: {
    label: 'Dolgulu',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    icon: '🔵',
  },
  root_canal: {
    label: 'Kanal Tedavili',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-400 dark:border-amber-700',
    icon: '🟠',
  },
  implant: {
    label: 'İmplant',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    icon: '🟣',
  },
  crown: {
    label: 'Kron / Kaplama',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-300 dark:border-sky-800',
    icon: '🔷',
  },
  missing: {
    label: 'Eksik Diş',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-500 line-through',
    border: 'border-slate-300 dark:border-slate-700',
    icon: '⚪',
  },
  extraction_needed: {
    label: 'Çekim Gerekiyor',
    bg: 'bg-red-100 dark:bg-red-950/60',
    text: 'text-red-800 dark:text-red-300 font-bold',
    border: 'border-red-500',
    icon: '🔻',
  },
};

const COMMON_DRUGS = [
  { name: 'Augmentin-BID 1000 mg Film Tablet', dosage: '1000 mg', frequency: '2x1 (12 saatte bir aç/tok)', instructions: 'Günde 2 kez sabah akşam tok karnına 1 tablet.' },
  { name: 'Apranax Fort 550 mg Film Tablet', dosage: '550 mg', frequency: '2x1 (Ağrı durumunda)', instructions: 'Ağrı hissettikçe yemekten sonra 1 tablet.' },
  { name: 'Klorhex %0.2 Ağız Gargarası', dosage: '200 ml', frequency: '3x1 (Günde 3 kez)', instructions: 'Yemeklerden sonra 1 kapak ile 1 dakika çalkalayıp tükürünüz.' },
  { name: 'Parol 500 mg Tablet', dosage: '500 mg', frequency: '3x1 (Gerektikçe)', instructions: 'Hafif ağrı ve ateşte günde 3 defaya kadar 1 tablet.' },
  { name: 'Arveles 25 mg Film Tablet', dosage: '25 mg', frequency: '2x1 (Tok karna)', instructions: 'Tok karnına günde en fazla 2 tablet.' },
];

export default function ExaminationClient({
  appointment,
  patient,
  existingToothRecords,
  treatmentPlan,
  treatmentSteps,
  procedureTemplates,
  prescription,
}: {
  appointment: any;
  patient: any;
  existingToothRecords: any[];
  treatmentPlan: any;
  treatmentSteps: any[];
  procedureTemplates: any[];
  prescription: any;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chart' | 'plan' | 'rx'>('chart');

  // Tooth map
  const [toothMap, setToothMap] = useState<Record<number, { condition: string; note: string }>>(() => {
    const map: Record<number, { condition: string; note: string }> = {};
    existingToothRecords.forEach((tr) => {
      map[tr.fdiNumber] = {
        condition: tr.condition,
        note: tr.clinicalNote || '',
      };
    });
    return map;
  });

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothCondition, setToothCondition] = useState<string>('healthy');
  const [toothNote, setToothNote] = useState<string>('');
  const [savingTooth, setSavingTooth] = useState(false);

  // Treatment Step Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [stepTooth, setStepTooth] = useState<string>('');
  const [stepTitle, setStepTitle] = useState<string>('');
  const [stepPrice, setStepPrice] = useState<number>(0);
  const [stepDuration, setStepDuration] = useState<number>(30);
  const [stepMode, setStepMode] = useState<'scheduled_session' | 'same_day_chairside'>('scheduled_session');
  const [addingStep, setAddingStep] = useState(false);

  // Prescription Form State
  const [medulaNo, setMedulaNo] = useState<string>(
    prescription?.medulaErefNo || `EREF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [diagnosis, setDiagnosis] = useState<string>(
    prescription?.diagnosis || 'K02.1 Dentin Çürüğü / Pulpa Hastalıkları'
  );
  const [meds, setMeds] = useState<any[]>(prescription?.medications || []);
  const [savingRx, setSavingRx] = useState(false);
  const [rxSaved, setRxSaved] = useState(false);

  // Completion State
  const [doctorSummary, setDoctorSummary] = useState<string>(treatmentPlan?.doctorSummaryNote || '');
  const [completing, setCompleting] = useState(false);

  // FDI Quadrants
  const q1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Üst Sağ
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Üst Sol
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Alt Sağ
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Alt Sol

  const handleSelectTooth = (num: number) => {
    setSelectedTooth(num);
    const existing = toothMap[num];
    if (existing) {
      setToothCondition(existing.condition);
      setToothNote(existing.note || '');
    } else {
      setToothCondition('healthy');
      setToothNote('');
    }
  };

  const handleSaveTooth = async () => {
    if (!selectedTooth) return;
    setSavingTooth(true);
    try {
      await saveToothCondition(
        appointment.id,
        patient.id,
        selectedTooth,
        toothCondition as any,
        toothNote
      );
      setToothMap((prev) => ({
        ...prev,
        [selectedTooth]: {
          condition: toothCondition,
          note: toothNote,
        },
      }));
    } finally {
      setSavingTooth(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = procedureTemplates.find((x) => x.id === templateId);
    if (t) {
      setStepTitle(t.name);
      setStepPrice(Number(t.defaultPrice));
      setStepDuration(t.defaultDurationMin);
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepTitle || stepPrice <= 0) return;
    setAddingStep(true);
    try {
      const res = await addTreatmentPlanStep(appointment.id, patient.id, {
        fdiNumber: stepTooth ? parseInt(stepTooth, 10) : undefined,
        procedureTemplateId: selectedTemplateId || undefined,
        title: stepTooth ? `Diş #${stepTooth} - ${stepTitle}` : stepTitle,
        price: stepPrice,
        durationMin: stepDuration,
        executionMode: stepMode,
      });
      if (!res.success) {
        alert(res.error);
        return;
      }
      // reset
      setStepTitle('');
      setStepTooth('');
      setSelectedTemplateId('');
      setStepPrice(0);
      router.refresh();
    } finally {
      setAddingStep(false);
    }
  };

  const [deleteStepId, setDeleteStepId] = useState<string | null>(null);
  const handleDeleteStep = async (stepId: string) => {
    setDeleteStepId(null);
    const res = await deleteTreatmentPlanStep(stepId, appointment.id);
    if (!res.success) alert(res.error);
    router.refresh();
  };

  const handleAddDrugPreset = (drug: any) => {
    if (meds.some((m) => m.name === drug.name)) return;
    setMeds([...meds, drug]);
  };

  const handleRemoveDrug = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index));
  };

  const handleSavePrescription = async () => {
    if (meds.length === 0) {
      alert('Lütfen reçeteye en az 1 ilaç ekleyiniz.');
      return;
    }
    setSavingRx(true);
    try {
      await savePrescriptionRecord(appointment.id, patient.id, {
        medulaErefNo: medulaNo,
        diagnosis,
        medications: meds,
      });
      setRxSaved(true);
      setTimeout(() => setRxSaved(false), 3000);
      router.refresh();
    } finally {
      setSavingRx(false);
    }
  };

  const handleFinishExamination = async () => {
    setCompleting(true);
    try {
      const res = await completeExaminationSession(appointment.id, patient.id, doctorSummary);
      if (res && !res.success) {
        alert(res.error);
        setCompleting(false);
      }
    } catch (err: any) {
      alert(err.message || 'Hata oluştu');
      setCompleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-(--color-bg-base)">
      {/* Top Patient Header Bar */}
      <header className="px-6 py-4 bg-(--color-bg-surface) border-b border-(--color-border-subtle) flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/doctor/workspace" aria-label="Geri Dön" className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-elevated) transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="w-11 h-11 rounded-2xl bg-(--color-primary-muted) text-(--color-primary) flex items-center justify-center font-bold text-lg shadow-2xs">
            🦷
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-(--color-text-primary)">
                {patient.firstName} {patient.lastName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-(--color-bg-elevated) text-(--color-text-secondary) font-mono border border-(--color-border-subtle)">
                {patient.phone}
              </span>
              {appointment.status === 'awaiting_chairside_payment' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                  ⚡ Koltukta Ek İşlem Kilidi
                </span>
              )}
            </div>
            <p className="text-xs text-(--color-text-secondary) mt-0.5 font-medium">
              {appointment.visitType === 'initial_exam' ? 'İlk Muayene' : 'Tedavi Seansı'} • Randevu Saati: <span className="font-mono font-bold">{appointment.startTime.slice(0, 5)}</span>
              {patient.medicalAlertNote && (
                <span className="ml-2 text-red-600 font-bold">⚠️ {patient.medicalAlertNote}</span>
              )}
            </p>
          </div>
        </div>

        {/* Completion Action */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleFinishExamination}
            disabled={completing}
            icon={<CheckCircle2 size={16} />}
            className="min-h-[44px] px-5 font-bold text-xs sm:text-sm shadow-(--shadow-primary-soft)"
          >
            {completing ? 'Tamamlanıyor...' : 'Muayeneyi Tamamla & Çıkışa Yönlendir'}
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="px-6 bg-(--color-bg-surface) border-b border-(--color-border-subtle) flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('chart')}
          className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'chart'
              ? 'border-(--color-primary) text-(--color-primary) bg-(--color-primary-muted)/30'
              : 'border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)'
          }`}
        >
          <span>🦷</span>
          <span>FDI Diş Çizelgesi (11–48)</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'plan'
              ? 'border-(--color-primary) text-(--color-primary) bg-(--color-primary-muted)/30'
              : 'border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)'
          }`}
        >
          <span>📋</span>
          <span>Tedavi Planı & Seans Fiyatları ({treatmentSteps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rx')}
          className={`min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'rx'
              ? 'border-(--color-primary) text-(--color-primary) bg-(--color-primary-muted)/30'
              : 'border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)'
          }`}
        >
          <span>💊</span>
          <span>E-Reçete (Medula)</span>
          {prescription && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ============================================================== */}
        {/* TAB 1: FDI DENTAL CHARTING */}
        {/* ============================================================== */}
        {activeTab === 'chart' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <Card padding="md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-(--color-border-subtle)">
                <div>
                  <h2 className="text-base font-bold text-(--color-text-primary)">
                    FDI Standart Diş Haritası (4 Kadran)
                  </h2>
                  <p className="text-xs text-(--color-text-muted)">
                    Durumunu kaydetmek istediğiniz dişe tıklayınız.
                  </p>
                </div>
                {/* Condition Legend */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {Object.entries(CONDITIONS).map(([key, info]) => (
                    <span
                      key={key}
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${info.bg} ${info.text} ${info.border}`}
                    >
                      {info.icon} {info.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* The Dental Matrix (Horizontal scroll container on small mobile screens) */}
              <div className="overflow-x-auto pb-4 pt-2">
                <div className="min-w-[640px] space-y-6 py-2">
                  {/* Upper Jaw (Üst Çene) */}
                  <div>
                    <p className="text-center text-xs font-bold uppercase tracking-wider text-(--color-text-muted) mb-2">
                      ÜST ÇENE (MAXILLA)
                    </p>
                    <div className="flex items-center justify-center gap-4 sm:gap-8">
                      {/* Q1: Üst Sağ (18-11) */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {q1.map((num) => {
                          const info = toothMap[num] ? CONDITIONS[toothMap[num].condition] || CONDITIONS.healthy : null;
                          const isSelected = selectedTooth === num;
                          return (
                            <button
                              key={num}
                              onClick={() => handleSelectTooth(num)}
                              className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isSelected
                                  ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary)'
                                  : info
                                  ? `${info.bg} ${info.text} ${info.border}`
                                  : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                              }`}
                            >
                              <span className="text-[10px] opacity-70">
                                {info?.icon || '🦷'}
                              </span>
                              <span className="font-mono text-xs sm:text-sm">{num}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="w-0.5 h-12 bg-(--color-border-subtle)" />

                      {/* Q2: Üst Sol (21-28) */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {q2.map((num) => {
                          const info = toothMap[num] ? CONDITIONS[toothMap[num].condition] || CONDITIONS.healthy : null;
                          const isSelected = selectedTooth === num;
                          return (
                            <button
                              key={num}
                              onClick={() => handleSelectTooth(num)}
                              className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isSelected
                                  ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary)'
                                  : info
                                  ? `${info.bg} ${info.text} ${info.border}`
                                  : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                              }`}
                            >
                              <span className="text-[10px] opacity-70">
                                {info?.icon || '🦷'}
                              </span>
                              <span className="font-mono text-xs sm:text-sm">{num}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Lower Jaw (Alt Çene) */}
                  <div>
                    <div className="flex items-center justify-center gap-4 sm:gap-8">
                      {/* Q4: Alt Sağ (48-41) */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {q4.map((num) => {
                          const info = toothMap[num] ? CONDITIONS[toothMap[num].condition] || CONDITIONS.healthy : null;
                          const isSelected = selectedTooth === num;
                          return (
                            <button
                              key={num}
                              onClick={() => handleSelectTooth(num)}
                              className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isSelected
                                  ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary)'
                                  : info
                                  ? `${info.bg} ${info.text} ${info.border}`
                                  : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                              }`}
                            >
                              <span className="font-mono text-xs sm:text-sm">{num}</span>
                              <span className="text-[10px] opacity-70">
                                {info?.icon || '🦷'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="w-0.5 h-12 bg-(--color-border-subtle)" />

                      {/* Q3: Alt Sol (31-38) */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {q3.map((num) => {
                          const info = toothMap[num] ? CONDITIONS[toothMap[num].condition] || CONDITIONS.healthy : null;
                          const isSelected = selectedTooth === num;
                          return (
                            <button
                              key={num}
                              onClick={() => handleSelectTooth(num)}
                              className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                isSelected
                                  ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary)'
                                  : info
                                  ? `${info.bg} ${info.text} ${info.border}`
                                  : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                              }`}
                            >
                              <span className="font-mono text-xs sm:text-sm">{num}</span>
                              <span className="text-[10px] opacity-70">
                                {info?.icon || '🦷'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-center text-xs font-bold uppercase tracking-wider text-(--color-text-muted) mt-2">
                      ALT ÇENE (MANDIBULA)
                    </p>
                  </div>
                </div>
              </div>

              {/* Tooth Editor Toolbar */}
              {selectedTooth ? (
                <div className="mt-6 pt-5 border-t border-(--color-border-subtle) bg-(--color-bg-elevated) p-4 rounded-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-(--color-primary) text-white font-mono font-bold flex items-center justify-center text-sm">
                        {selectedTooth}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-(--color-text-primary)">
                          Diş #{selectedTooth} Durum Kaydı
                        </h3>
                        <p className="text-[11px] text-(--color-text-muted)">
                          Hızlı durum seçip not ekleyebilirsiniz.
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveTooth}
                      disabled={savingTooth}
                      icon={<Save size={14} />}
                    >
                      {savingTooth ? 'Kaydediliyor...' : 'Diş Durumunu Kaydet'}
                    </Button>
                  </div>

                  {/* Condition Selector Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {Object.entries(CONDITIONS).map(([key, info]) => {
                      const active = toothCondition === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setToothCondition(key)}
                          className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                            active
                              ? `${info.bg} ${info.text} ring-2 ring-(--color-primary) font-bold border-(--color-primary)`
                              : 'bg-(--color-bg-surface) text-(--color-text-secondary) border-(--color-border-subtle) hover:border-(--color-primary)/50'
                          }`}
                        >
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Clinical Note & Plan Action */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Klinik not veya kavite detayı (örn: MOD derin çürük, perküsyon +)..."
                      value={toothNote}
                      onChange={(e) => setToothNote(e.target.value)}
                      className="flex-1 w-full px-3 py-2 text-xs rounded-lg bg-(--color-bg-surface) border border-(--color-border-subtle) text-(--color-text-primary)"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStepTooth(selectedTooth.toString());
                        setActiveTab('plan');
                      }}
                      className="shrink-0 text-xs text-(--color-primary)"
                    >
                      + Bu Dişe Tedavi Adımı Ekle
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-(--color-border-subtle) text-center text-xs text-(--color-text-muted)">
                  Diş durumu kaydetmek için lütfen yukarıdaki dişlerden birini seçiniz.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TEDAVİ PLANI & SEANS FİYATLANDIRMA */}
        {/* ============================================================== */}
        {activeTab === 'plan' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Add Step Card */}
            <Card padding="md">
              <h2 className="text-sm font-bold text-(--color-text-primary) mb-3 flex items-center gap-2">
                <Plus size={16} className="text-(--color-primary)" />
                Tedavi Planına Yeni Adım / Seans Ekle
              </h2>

              <form onSubmit={handleAddStep} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Template Picker */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-(--color-text-muted) mb-1">
                      Klinik İşlem Şablonu
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary)"
                    >
                      <option value="">-- Şablon Seçiniz veya Manuel Yazınız --</option>
                      {procedureTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({Number(t.defaultPrice).toLocaleString('tr-TR')} ₺ - {t.defaultDurationMin} dk)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FDI Tooth No */}
                  <div>
                    <label className="block text-xs font-medium text-(--color-text-muted) mb-1">
                      İlgili Diş No (Opsiyonel)
                    </label>
                    <input
                      type="number"
                      placeholder="Örn: 16, 21..."
                      value={stepTooth}
                      onChange={(e) => setStepTooth(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary)"
                      min="11"
                      max="48"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Step Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-(--color-text-muted) mb-1">
                      Adım / Seans Başlığı *
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 1. Seans - Kök Kanal Temizliği"
                      value={stepTitle}
                      onChange={(e) => setStepTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary)"
                      required
                    />
                  </div>

                  {/* Net Price */}
                  <div>
                    <label className="block text-xs font-medium text-(--color-text-muted) mb-1">
                      Fiyat (₺) *
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={stepPrice || ''}
                      onChange={(e) => setStepPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary)"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-medium text-(--color-text-muted) mb-1">
                      Tahmini Süre (Dk)
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={stepDuration}
                      onChange={(e) => setStepDuration(parseInt(e.target.value, 10) || 30)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary)"
                    />
                  </div>
                </div>

                {/* Execution Mode (Gelecek Seans vs Koltukta Uygula) */}
                <div className="p-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-(--color-text-primary)">
                      <input
                        type="radio"
                        name="execMode"
                        checked={stepMode === 'scheduled_session'}
                        onChange={() => setStepMode('scheduled_session')}
                        className="text-(--color-primary)"
                      />
                      📅 Gelecek Seans Randevusu
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-600 dark:text-amber-400">
                      <input
                        type="radio"
                        name="execMode"
                        checked={stepMode === 'same_day_chairside'}
                        onChange={() => setStepMode('same_day_chairside')}
                        className="text-amber-600"
                      />
                      ⚡ Bugün Koltukta Uygulandı (Çıkışta Tahsilat)
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={addingStep || !stepTitle || stepPrice <= 0}
                    icon={<Plus size={14} />}
                    className="font-bold text-xs"
                  >
                    {addingStep ? 'Ekleniyor...' : 'Adımı Tedavi Planına Ekle'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Steps List */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-(--color-border-subtle)">
                <div>
                  <h3 className="text-sm font-bold text-(--color-text-primary)">
                    Planlanan Tedavi Adımları ({treatmentSteps.length})
                  </h3>
                  <p className="text-xs text-(--color-text-muted)">
                    Toplam Plan Tutarı:{' '}
                    <strong className="text-(--color-primary) text-sm">
                      {treatmentSteps
                        .reduce((sum, s) => sum + Number(s.price), 0)
                        .toLocaleString('tr-TR')}{' '}
                      ₺
                    </strong>
                  </p>
                </div>
              </div>

              {treatmentSteps.length === 0 ? (
                <p className="text-xs text-(--color-text-muted) py-6 text-center">
                  Henüz tedavi adımı eklenmedi. Yukarıdaki formdan adım ekleyebilirsiniz.
                </p>
              ) : (
                <div className="space-y-3">
                  {treatmentSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        step.executionMode === 'same_day_chairside'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                          : 'bg-(--color-bg-elevated) border-(--color-border-subtle)'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-(--color-primary)/10 text-(--color-primary) text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-(--color-text-primary)">
                              {step.title}
                            </h4>
                            {step.fdiNumber && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-(--color-bg-surface) text-(--color-text-muted) border border-(--color-border-subtle)">
                                Diş #{step.fdiNumber}
                              </span>
                            )}
                            {step.executionMode === 'same_day_chairside' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1">
                                <Zap size={10} /> Koltukta Yapıldı
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-(--color-text-muted) mt-0.5">
                            Tahmini Süre: {step.durationMin} dk • Durum:{' '}
                            <span className="font-semibold text-(--color-text-secondary)">
                              {step.status === 'awaiting_payment'
                                ? 'Banko Tahsilatı Bekleniyor'
                                : step.status === 'paid'
                                ? 'Ödendi'
                                : step.status === 'scheduled'
                                ? 'Randevusu Verildi'
                                : 'Planlandı'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <span className="text-base font-bold text-(--color-primary)">
                          {Number(step.price).toLocaleString('tr-TR')} ₺
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteStepId(step.id)}
                          icon={<Trash2 size={14} className="text-rose-500" />}
                          aria-label="Sil"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Doctor Summary Note */}
            <Card padding="md">
              <h3 className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-2">
                Hekim Genel Tedavi Özeti & Notu
              </h3>
              <textarea
                rows={3}
                placeholder="Hasta için genel klinik değerlendirme ve önerilerinizi yazınız..."
                value={doctorSummary}
                onChange={(e) => setDoctorSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary)"
              />
            </Card>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: E-REÇETE (MEDULA ENTEGRASYON TASLAĞI) */}
        {/* ============================================================== */}
        {activeTab === 'rx' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card padding="md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-(--color-border-subtle)">
                <div className="flex items-center gap-2">
                  <Pill size={18} className="text-(--color-primary)" />
                  <div>
                    <h2 className="text-sm font-bold text-(--color-text-primary)">
                      Medula / Dijital E-Reçete
                    </h2>
                    <p className="text-xs text-(--color-text-muted)">
                      Hastanın portalına anında yansır; eczaneden bu numara ile teslim alınır.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSavePrescription}
                  disabled={savingRx}
                  icon={rxSaved ? <Check size={14} /> : <Save size={14} />}
                  className="font-bold text-xs"
                >
                  {savingRx ? 'Kaydediliyor...' : rxSaved ? 'Kaydedildi ✓' : 'E-Reçeteyi Kaydet'}
                </Button>
              </div>

              {/* Medula Info Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-(--color-text-muted) mb-1">
                    Medula E-Reçete No (E-Ref)
                  </label>
                  <input
                    type="text"
                    value={medulaNo}
                    onChange={(e) => setMedulaNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-primary)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-(--color-text-muted) mb-1">
                    Klinik Tanı (ICD-10)
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary)"
                  />
                </div>
              </div>

              {/* Fast Presets */}
              <div className="mb-5">
                <p className="text-xs font-bold text-(--color-text-muted) mb-2">
                  Sık Kullanılan Diş Hekimi İlaçları (Tek Tıkla Ekle):
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DRUGS.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => handleAddDrugPreset(d)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-(--color-bg-elevated) border border-(--color-border-subtle) hover:border-(--color-primary) text-(--color-text-secondary) flex items-center gap-1.5 transition-all"
                    >
                      <Plus size={12} className="text-(--color-primary)" />
                      {d.name.split(' ')[0]} ({d.dosage})
                    </button>
                  ))}
                </div>
              </div>

              {/* Prescription Items */}
              <div>
                <h3 className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider mb-2">
                  Reçetedeki İlaçlar ({meds.length})
                </h3>

                {meds.length === 0 ? (
                  <p className="text-xs text-(--color-text-muted) py-6 text-center border rounded-xl border-dashed">
                    Reçetede henüz ilaç yok. Yukarıdaki hızlı butonları kullanarak ekleyiniz.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {meds.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-(--color-text-primary)">
                            {idx + 1}. {m.name}
                          </p>
                          <p className="text-xs text-(--color-text-muted) mt-0.5">
                            Doz: <strong className="text-(--color-text-secondary)">{m.dosage}</strong> • Periyot: <strong className="text-(--color-text-secondary)">{m.frequency}</strong>
                          </p>
                          {m.instructions && (
                            <p className="text-[11px] text-(--color-text-muted) italic mt-0.5">
                              {m.instructions}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDrug(idx)}
                          icon={<Trash2 size={14} className="text-rose-500" />}
                          aria-label="Kaldır"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={!!deleteStepId}
        title="Tedavi Adımını Sil"
        danger
        message="Bu adım tedavi planından kaldırılacak."
        confirmLabel="Sil"
        onConfirm={() => (deleteStepId ? handleDeleteStep(deleteStepId) : undefined)}
        onClose={() => setDeleteStepId(null)}
      />
    </div>
  );
}
