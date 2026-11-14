'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import {
  Sparkles,
  RefreshCw,
  Check,
  Save,
  Plus,
  Trash2,
  Printer,
  Smartphone,
  Stethoscope,
  FileSpreadsheet,
  Info,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

// ==============================================================
// 1. DENTAL DEFINITIONS & ANATOMICAL LABELS
// ==============================================================

type ToothConditionKey =
  | 'healthy'
  | 'caries'
  | 'filling'
  | 'root_canal'
  | 'implant'
  | 'crown'
  | 'missing'
  | 'extraction_needed';

interface ConditionMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: string;
  desc: string;
}

const CONDITIONS: Record<ToothConditionKey, ConditionMeta> = {
  healthy: {
    label: 'Sağlam',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    icon: '🟢',
    desc: 'Doğal ve sağlıklı diş dokusu.',
  },
  caries: {
    label: 'Çürük',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-400 dark:border-rose-800',
    icon: '🔴',
    desc: 'Kavite / çürük lezyonu mevcut.',
  },
  filling: {
    label: 'Dolgulu',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    icon: '🔵',
    desc: 'Mevcut kompozit / amalgam restorasyon.',
  },
  root_canal: {
    label: 'Kanal Tedavili',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-400 dark:border-amber-700',
    icon: '🟠',
    desc: 'Endodontik tedavi (kök kanal dolgusu).',
  },
  implant: {
    label: 'İmplant',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    icon: '🟣',
    desc: 'Kemik içi titanyum implant vidası.',
  },
  crown: {
    label: 'Kron / Kaplama',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-300 dark:border-sky-800',
    icon: '🔷',
    desc: 'Zirkonyum / porselen kaplama protez.',
  },
  missing: {
    label: 'Eksik Diş',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-500 line-through',
    border: 'border-slate-300 dark:border-slate-700',
    icon: '⚪',
    desc: 'Ağızda bulunmayan çekilmiş diş boşluğu.',
  },
  extraction_needed: {
    label: 'Çekim Gerekiyor',
    bg: 'bg-red-100 dark:bg-red-950/60',
    text: 'text-red-800 dark:text-red-300 font-bold',
    border: 'border-red-500',
    icon: '🔻',
    desc: 'Kurtarılamaz diş, çekim endikasyonu.',
  },
};

const TOOTH_NAMES: Record<number, string> = {
  18: 'Üst Sağ 3. Molar (20 Yaş)',
  17: 'Üst Sağ 2. Molar (Büyük Azı)',
  16: 'Üst Sağ 1. Molar (Büyük Azı)',
  15: 'Üst Sağ 2. Premolar (Küçük Azı)',
  14: 'Üst Sağ 1. Premolar (Küçük Azı)',
  13: 'Üst Sağ Kanin (Köpek Dişi)',
  12: 'Üst Sağ Lateral Kesici',
  11: 'Üst Sağ Santral Kesici',
  21: 'Üst Sol Santral Kesici',
  22: 'Üst Sol Lateral Kesici',
  23: 'Üst Sol Kanin (Köpek Dişi)',
  24: 'Üst Sol 1. Premolar (Küçük Azı)',
  25: 'Üst Sol 2. Premolar (Küçük Azı)',
  26: 'Üst Sol 1. Molar (Büyük Azı)',
  27: 'Üst Sol 2. Molar (Büyük Azı)',
  28: 'Üst Sol 3. Molar (20 Yaş)',
  48: 'Alt Sağ 3. Molar (20 Yaş)',
  47: 'Alt Sağ 2. Molar (Büyük Azı)',
  46: 'Alt Sağ 1. Molar (Büyük Azı)',
  45: 'Alt Sağ 2. Premolar (Küçük Azı)',
  44: 'Alt Sağ 1. Premolar (Küçük Azı)',
  43: 'Alt Sağ Kanin (Köpek Dişi)',
  42: 'Alt Sağ Lateral Kesici',
  41: 'Alt Sağ Santral Kesici',
  31: 'Alt Sol Santral Kesici',
  32: 'Alt Sol Lateral Kesici',
  33: 'Alt Sol Kanin (Köpek Dişi)',
  34: 'Alt Sol 1. Premolar (Küçük Azı)',
  35: 'Alt Sol 2. Premolar (Küçük Azı)',
  36: 'Alt Sol 1. Molar (Büyük Azı)',
  37: 'Alt Sol 2. Molar (Büyük Azı)',
  38: 'Alt Sol 3. Molar (20 Yaş)',
};

const PROCEDURE_TEMPLATES = [
  { id: 't1', title: 'Kompozit Dolgu (Tek Yüzlü)', price: 1200, duration: 30 },
  { id: 't2', title: 'Kompozit Dolgu (İki / Üç Yüzlü - MOD)', price: 1600, duration: 45 },
  { id: 't3', title: 'Tek Seans Kök Kanal Tedavisi', price: 3200, duration: 60 },
  { id: 't4', title: 'Zirkonyum Porselen Kron / Kaplama', price: 4500, duration: 45 },
  { id: 't5', title: 'Basit Diş Çekimi', price: 900, duration: 20 },
  { id: 't6', title: 'Cerrahi Gömülü 20 Yaş Çekimi', price: 2800, duration: 45 },
  { id: 't7', title: 'Titanyum Dental İmplant', price: 12500, duration: 60 },
  { id: 't8', title: 'Detertraj (Diş Taşı Temizliği) & Polisaj', price: 1000, duration: 30 },
];

interface ToothRecord {
  condition: ToothConditionKey;
  clinicalNote?: string;
  updatedAt: string;
}

interface TreatmentStep {
  id: string;
  fdiNumber: number;
  title: string;
  price: number;
  durationMin: number;
  executionMode: 'scheduled_session' | 'same_day_chairside';
  status: 'planned' | 'paid' | 'completed';
}

// 4 Quadrants
const q1 = [18, 17, 16, 15, 14, 13, 12, 11];
const q2 = [21, 22, 23, 24, 25, 26, 27, 28];
const q4 = [48, 47, 46, 45, 44, 43, 42, 41];
const q3 = [31, 32, 33, 34, 35, 36, 37, 38];

// ==============================================================
// 2. PRE-SET SCENARIOS
// ==============================================================

const SCENARIO_1: {
  name: string;
  patientName: string;
  doctorName: string;
  teeth: Record<number, ToothRecord>;
  steps: TreatmentStep[];
} = {
  name: 'Vaka 1: Çürük, Dolgu & Kanal Tedavisi',
  patientName: 'Ahmet Yılmaz',
  doctorName: 'Dr. Dt. Mehmet Yılmaz',
  teeth: {
    16: { condition: 'caries', clinicalNote: 'Derin oklüzal çürük, soğuk hassasiyeti var', updatedAt: 'Bugün' },
    24: { condition: 'root_canal', clinicalNote: 'Kanal tedavisi tamamlandı, daimi dolgu aşaması', updatedAt: 'Bugün' },
    36: { condition: 'filling', clinicalNote: 'Eski amalgam dolguda marjinal sızıntı', updatedAt: '6 ay önce' },
    47: { condition: 'caries', clinicalNote: 'Aproksimal çürük başlangıcı', updatedAt: 'Bugün' },
    18: { condition: 'missing', clinicalNote: 'Daha önce çekilmiş', updatedAt: '2 yıl önce' },
    28: { condition: 'extraction_needed', clinicalNote: 'Yarı gömülü, perikoronit atağı', updatedAt: 'Bugün' },
  },
  steps: [
    {
      id: 's1',
      fdiNumber: 16,
      title: 'Kompozit Dolgu (Tek Yüzlü)',
      price: 1200,
      durationMin: 30,
      executionMode: 'same_day_chairside',
      status: 'completed',
    },
    {
      id: 's2',
      fdiNumber: 24,
      title: 'Tek Seans Kök Kanal Tedavisi',
      price: 3200,
      durationMin: 60,
      executionMode: 'scheduled_session',
      status: 'planned',
    },
    {
      id: 's3',
      fdiNumber: 28,
      title: 'Cerrahi Gömülü 20 Yaş Çekimi',
      price: 2800,
      durationMin: 45,
      executionMode: 'scheduled_session',
      status: 'planned',
    },
  ],
};

const SCENARIO_2: {
  name: string;
  patientName: string;
  doctorName: string;
  teeth: Record<number, ToothRecord>;
  steps: TreatmentStep[];
} = {
  name: 'Vaka 2: İmplant & Zirkonyum Kaplama',
  patientName: 'Ayşe Kaya',
  doctorName: 'Dr. Dt. Zeynep Kaya',
  teeth: {
    11: { condition: 'crown', clinicalNote: 'Zirkonyum kaplama estetik bölge', updatedAt: 'Bugün' },
    21: { condition: 'crown', clinicalNote: 'Zirkonyum kaplama estetik bölge', updatedAt: 'Bugün' },
    46: { condition: 'implant', clinicalNote: 'Kemik seviyesi implant yerleşimi', updatedAt: 'Bugün' },
    36: { condition: 'missing', clinicalNote: 'Kemik ogmentasyonu planlandı', updatedAt: '1 ay önce' },
  },
  steps: [
    {
      id: 's1',
      fdiNumber: 46,
      title: 'Titanyum Dental İmplant',
      price: 12500,
      durationMin: 60,
      executionMode: 'scheduled_session',
      status: 'planned',
    },
    {
      id: 's2',
      fdiNumber: 11,
      title: 'Zirkonyum Porselen Kron / Kaplama',
      price: 4500,
      durationMin: 45,
      executionMode: 'scheduled_session',
      status: 'planned',
    },
    {
      id: 's3',
      fdiNumber: 21,
      title: 'Zirkonyum Porselen Kron / Kaplama',
      price: 4500,
      durationMin: 45,
      executionMode: 'scheduled_session',
      status: 'planned',
    },
  ],
};

// ==============================================================
// 3. MAIN DEMO COMPONENT
// ==============================================================

export default function StandaloneDentalMapDemo() {
  const [activeView, setActiveView] = useState<'doctor' | 'patient' | 'matrix'>('doctor');
  const [currentScenario, setCurrentScenario] = useState<'case1' | 'case2' | 'empty'>('case1');

  // State
  const [teeth, setTeeth] = useState<Record<number, ToothRecord>>(SCENARIO_1.teeth);
  const [steps, setSteps] = useState<TreatmentStep[]>(SCENARIO_1.steps);
  const [patientName, setPatientName] = useState(SCENARIO_1.patientName);
  const [doctorName, setDoctorName] = useState(SCENARIO_1.doctorName);

  // Selected tooth for editing
  const [selectedTooth, setSelectedTooth] = useState<number | null>(16);
  const [editingCondition, setEditingCondition] = useState<ToothConditionKey>('caries');
  const [editingNote, setEditingNote] = useState('Derin oklüzal çürük, soğuk hassasiyeti var');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Treatment step creator modal / inline form
  const [stepTemplateId, setStepTemplateId] = useState(PROCEDURE_TEMPLATES[0].id);
  const [stepPrice, setStepPrice] = useState(PROCEDURE_TEMPLATES[0].price);
  const [stepMode, setStepMode] = useState<'scheduled_session' | 'same_day_chairside'>('scheduled_session');

  // Load scenarios
  function loadScenario(type: 'case1' | 'case2' | 'empty') {
    setCurrentScenario(type);
    if (type === 'case1') {
      setTeeth(SCENARIO_1.teeth);
      setSteps(SCENARIO_1.steps);
      setPatientName(SCENARIO_1.patientName);
      setDoctorName(SCENARIO_1.doctorName);
      setSelectedTooth(16);
      setEditingCondition('caries');
      setEditingNote(SCENARIO_1.teeth[16].clinicalNote || '');
    } else if (type === 'case2') {
      setTeeth(SCENARIO_2.teeth);
      setSteps(SCENARIO_2.steps);
      setPatientName(SCENARIO_2.patientName);
      setDoctorName(SCENARIO_2.doctorName);
      setSelectedTooth(46);
      setEditingCondition('implant');
      setEditingNote(SCENARIO_2.teeth[46].clinicalNote || '');
    } else {
      setTeeth({});
      setSteps([]);
      setPatientName('Yeni Muayene Hastası');
      setDoctorName('Dr. Dt. Mehmet Yılmaz');
      setSelectedTooth(null);
      setEditingCondition('healthy');
      setEditingNote('');
    }
    showToast('Örnek vaka başarıyla yüklendi!');
  }

  function handleSelectTooth(num: number) {
    setSelectedTooth(num);
    const existing = teeth[num];
    if (existing) {
      setEditingCondition(existing.condition);
      setEditingNote(existing.clinicalNote || '');
    } else {
      setEditingCondition('healthy');
      setEditingNote('');
    }
  }

  function handleSaveTooth() {
    if (!selectedTooth) return;
    setTeeth((prev) => ({
      ...prev,
      [selectedTooth]: {
        condition: editingCondition,
        clinicalNote: editingNote.trim(),
        updatedAt: 'Şimdi',
      },
    }));
    showToast(`Diş #${selectedTooth} durumu güncellendi.`);
  }

  function handleAddStep(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTooth) return;
    const tpl = PROCEDURE_TEMPLATES.find((t) => t.id === stepTemplateId) || PROCEDURE_TEMPLATES[0];
    const newStep: TreatmentStep = {
      id: 'step_' + Date.now(),
      fdiNumber: selectedTooth,
      title: tpl.title,
      price: Number(stepPrice) || tpl.price,
      durationMin: tpl.duration,
      executionMode: stepMode,
      status: stepMode === 'same_day_chairside' ? 'completed' : 'planned',
    };
    setSteps((prev) => [...prev, newStep]);
    showToast(`Diş #${selectedTooth} için "${tpl.title}" planlandı.`);
  }

  function handleDeleteStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    showToast('Tedavi adımı çıkarıldı.');
  }

  function showToast(msg: string) {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  }

  const totalPrice = steps.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary) flex flex-col font-sans">
      {/* ============================================================== */}
      {/* 1. TOP DEMO ANNOUNCEMENT BAR */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-(--color-bg-surface)/95 backdrop-blur-md border-b border-(--color-border-subtle) px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--color-primary) text-white flex items-center justify-center font-bold shadow-xs">
              🦷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-(--color-text-primary) tracking-tight">
                  Denta<span className="text-(--color-primary)">Panel</span> Diş Haritası & Tedavi Planı
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Sparkles size={11} className="text-amber-600" /> Bağımsız Demo
                </span>
              </div>
              <p className="text-xs text-(--color-text-muted)">
                Giriş yapmadan tüm FDI odontogram etkileşimlerini deneyimleyin.
              </p>
            </div>
          </div>

          {/* Quick Scenario Buttons & Reset */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-(--color-text-muted) mr-1 hidden sm:inline">
              Hazır Vakalar:
            </span>
            <button
              onClick={() => loadScenario('case1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                currentScenario === 'case1'
                  ? 'bg-(--color-primary) text-white border-(--color-primary) shadow-xs'
                  : 'bg-(--color-bg-elevated) hover:bg-slate-200 border-(--color-border-subtle) text-(--color-text-primary)'
              }`}
            >
              1. Dolgu & Kanal
            </button>
            <button
              onClick={() => loadScenario('case2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                currentScenario === 'case2'
                  ? 'bg-(--color-primary) text-white border-(--color-primary) shadow-xs'
                  : 'bg-(--color-bg-elevated) hover:bg-slate-200 border-(--color-border-subtle) text-(--color-text-primary)'
              }`}
            >
              2. İmplant & Kaplama
            </button>
            <button
              onClick={() => loadScenario('empty')}
              title="Tüm dişleri sıfırlar"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. PERSPECTIVE TABS (HEKİM vs HASTA vs MATRİS) */}
      {/* ============================================================== */}
      <div className="bg-(--color-bg-surface) border-b border-(--color-border-subtle) px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveView('doctor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'doctor'
                  ? 'bg-(--color-primary) text-white shadow-xs'
                  : 'text-(--color-text-secondary) hover:bg-(--color-bg-elevated)'
              }`}
            >
              <Stethoscope size={15} />
              <span>1. Hekim Muayene Paneli (FDI Haritası)</span>
            </button>

            <button
              onClick={() => setActiveView('patient')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'patient'
                  ? 'bg-(--color-primary) text-white shadow-xs'
                  : 'text-(--color-text-secondary) hover:bg-(--color-bg-elevated)'
              }`}
            >
              <Smartphone size={15} />
              <span>2. Hasta Portalı Simülatörü</span>
            </button>

            <button
              onClick={() => setActiveView('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeView === 'matrix'
                  ? 'bg-(--color-primary) text-white shadow-xs'
                  : 'text-(--color-text-secondary) hover:bg-(--color-bg-elevated)'
              }`}
            >
              <FileSpreadsheet size={15} />
              <span>3. Toplu Klinik Raporu</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
            <span>Aktif Hasta:</span>
            <strong className="text-(--color-text-primary)">{patientName}</strong>
            <span className="text-slate-300">•</span>
            <span>Hekim:</span>
            <strong className="text-(--color-text-primary)">{doctorName}</strong>
          </div>
        </div>
      </div>

      {/* Floating Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-(--color-text-primary) text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. VIEW 1: DENTIST WORKSPACE & INTERACTIVE FDI MAP */}
      {/* ============================================================== */}
      {activeView === 'doctor' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT / CENTER: THE DENTAL MATRIX & TOOTH EDITOR (2 COLS) */}
            <div className="lg:col-span-2 space-y-6">
              <Card padding="md">
                {/* Header & Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-(--color-border-subtle)">
                  <div>
                    <h2 className="text-base font-bold text-(--color-text-primary) flex items-center gap-2">
                      <span>FDI Standart Diş Haritası (4 Kadran)</span>
                    </h2>
                    <p className="text-xs text-(--color-text-muted)">
                      Durumunu değiştirmek veya tedavi eklemek istediğiniz dişe tıklayınız.
                    </p>
                  </div>

                  {/* Quick Condition Indicators */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {Object.entries(CONDITIONS).map(([key, info]) => (
                      <span
                        key={key}
                        className={`px-2 py-0.5 rounded-md border text-[11px] font-medium flex items-center gap-1 ${info.bg} ${info.text} ${info.border}`}
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* THE 4-QUADRANT MATRIX CONTAINER */}
                <div className="overflow-x-auto pb-4 pt-2">
                  <div className="min-w-[640px] space-y-6 py-2 select-none">
                    {/* ÜST ÇENE (MAXILLA) */}
                    <div>
                      <p className="text-center text-xs font-bold uppercase tracking-wider text-(--color-text-muted) mb-2">
                        ÜST ÇENE (MAXILLA)
                      </p>
                      <div className="flex items-center justify-center gap-4 sm:gap-6">
                        {/* Q1: Üst Sağ (18-11) */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {q1.map((num) => {
                            const rec = teeth[num];
                            const info = rec ? CONDITIONS[rec.condition] || CONDITIONS.healthy : null;
                            const isSelected = selectedTooth === num;
                            return (
                              <button
                                key={num}
                                onClick={() => handleSelectTooth(num)}
                                className={`w-9 h-12 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                  isSelected
                                    ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary) bg-teal-50/70 z-10'
                                    : info
                                    ? `${info.bg} ${info.text} ${info.border} hover:scale-102`
                                    : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                                }`}
                              >
                                <span className="text-[11px]">{info?.icon || '🦷'}</span>
                                <span className="font-mono text-xs sm:text-sm mt-0.5">{num}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Midline Divider */}
                        <div className="w-0.5 h-12 bg-(--color-border-subtle) mx-1" />

                        {/* Q2: Üst Sol (21-28) */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {q2.map((num) => {
                            const rec = teeth[num];
                            const info = rec ? CONDITIONS[rec.condition] || CONDITIONS.healthy : null;
                            const isSelected = selectedTooth === num;
                            return (
                              <button
                                key={num}
                                onClick={() => handleSelectTooth(num)}
                                className={`w-9 h-12 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                  isSelected
                                    ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary) bg-teal-50/70 z-10'
                                    : info
                                    ? `${info.bg} ${info.text} ${info.border} hover:scale-102`
                                    : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                                }`}
                              >
                                <span className="text-[11px]">{info?.icon || '🦷'}</span>
                                <span className="font-mono text-xs sm:text-sm mt-0.5">{num}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ALT ÇENE (MANDIBULA) */}
                    <div>
                      <div className="flex items-center justify-center gap-4 sm:gap-6">
                        {/* Q4: Alt Sağ (48-41) */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {q4.map((num) => {
                            const rec = teeth[num];
                            const info = rec ? CONDITIONS[rec.condition] || CONDITIONS.healthy : null;
                            const isSelected = selectedTooth === num;
                            return (
                              <button
                                key={num}
                                onClick={() => handleSelectTooth(num)}
                                className={`w-9 h-12 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                  isSelected
                                    ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary) bg-teal-50/70 z-10'
                                    : info
                                    ? `${info.bg} ${info.text} ${info.border} hover:scale-102`
                                    : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                                }`}
                              >
                                <span className="font-mono text-xs sm:text-sm mb-0.5">{num}</span>
                                <span className="text-[11px]">{info?.icon || '🦷'}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Midline Divider */}
                        <div className="w-0.5 h-12 bg-(--color-border-subtle) mx-1" />

                        {/* Q3: Alt Sol (31-38) */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {q3.map((num) => {
                            const rec = teeth[num];
                            const info = rec ? CONDITIONS[rec.condition] || CONDITIONS.healthy : null;
                            const isSelected = selectedTooth === num;
                            return (
                              <button
                                key={num}
                                onClick={() => handleSelectTooth(num)}
                                className={`w-9 h-12 sm:w-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                  isSelected
                                    ? 'ring-3 ring-(--color-primary) scale-105 border-(--color-primary) bg-teal-50/70 z-10'
                                    : info
                                    ? `${info.bg} ${info.text} ${info.border} hover:scale-102`
                                    : 'bg-(--color-bg-elevated) text-(--color-text-primary) border-(--color-border-subtle) hover:border-(--color-primary)'
                                }`}
                              >
                                <span className="font-mono text-xs sm:text-sm mb-0.5">{num}</span>
                                <span className="text-[11px]">{info?.icon || '🦷'}</span>
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

                {/* TOOTH EDITOR PANEL (SHOWN WHEN TOOTH IS CLICKED) */}
                {selectedTooth ? (
                  <div className="mt-4 pt-4 border-t border-(--color-border-subtle) bg-(--color-bg-elevated) p-4 rounded-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-(--color-primary) text-white font-mono font-bold flex items-center justify-center text-base shadow-xs">
                          {selectedTooth}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-(--color-text-primary)">
                            Diş #{selectedTooth}: {TOOTH_NAMES[selectedTooth] || 'Diş'}
                          </h3>
                          <p className="text-xs text-(--color-text-muted)">
                            Durumu seçip sağdaki butona basarak kaydedebilirsiniz.
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveTooth}
                        icon={<Save size={14} />}
                      >
                        Diş Durumunu Kaydet
                      </Button>
                    </div>

                    {/* Condition Selector Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {Object.entries(CONDITIONS).map(([key, info]) => {
                        const active = editingCondition === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setEditingCondition(key as ToothConditionKey)}
                            className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                              active
                                ? `${info.bg} ${info.text} ring-2 ring-(--color-primary) font-bold border-(--color-primary) shadow-xs`
                                : 'bg-(--color-bg-surface) text-(--color-text-secondary) border-(--color-border-subtle) hover:border-(--color-primary)/50'
                            }`}
                          >
                            <span className="text-sm">{info.icon}</span>
                            <span className="truncate">{info.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Note Input */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      <input
                        type="text"
                        placeholder="Klinik not veya kavite detayı (örn: Oklüzal derin çürük, perküsyon +)..."
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        className="flex-1 w-full px-3.5 py-2 text-xs rounded-xl bg-(--color-bg-surface) border border-(--color-border-subtle) text-(--color-text-primary) focus:ring-2 focus:ring-(--color-primary) outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-(--color-border-subtle) text-center text-xs text-(--color-text-muted) py-3">
                    👆 Durumunu incelemek veya düzenlemek için yukarıdaki dişlerden birine tıklayınız.
                  </div>
                )}
              </Card>

              {/* RECORDED TEETH LIST IN CURRENT SESSION */}
              <Card padding="md">
                <h3 className="text-sm font-bold text-(--color-text-primary) mb-3 flex items-center justify-between">
                  <span>Kaydedilen Diş Durumları ({Object.keys(teeth).length})</span>
                  <span className="text-xs text-(--color-text-muted) font-normal">
                    FDI Tablosuna işlenen kayıtlar
                  </span>
                </h3>

                {Object.keys(teeth).length === 0 ? (
                  <p className="text-xs text-(--color-text-muted) text-center py-4">
                    Henüz diş kaydı girilmedi. Haritadan bir dişe tıklayarak durum atayabilirsiniz.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(teeth).map(([numStr, rec]) => {
                      const num = Number(numStr);
                      const info = CONDITIONS[rec.condition];
                      return (
                        <div
                          key={num}
                          onClick={() => handleSelectTooth(num)}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-2 cursor-pointer transition-all hover:border-(--color-primary) ${
                            selectedTooth === num ? 'ring-2 ring-(--color-primary) bg-teal-50/50' : 'bg-(--color-bg-surface)'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-(--color-bg-elevated) font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-(--color-border-subtle)">
                              {num}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">{info.icon}</span>
                                <span className={`text-xs font-bold ${info.text}`}>{info.label}</span>
                              </div>
                              <p className="text-[11px] text-(--color-text-muted) mt-0.5 truncate max-w-[180px]">
                                {TOOTH_NAMES[num]}
                              </p>
                              {rec.clinicalNote && (
                                <p className="text-[11px] text-(--color-text-secondary) italic mt-1 bg-(--color-bg-elevated) px-2 py-0.5 rounded">
                                  &ldquo;{rec.clinicalNote}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-(--color-text-muted) shrink-0">{rec.updatedAt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* RIGHT COLUMN: TREATMENT PLAN & FINANCIAL FORM */}
            <div className="space-y-6">
              {/* Add Step Card */}
              <Card padding="md" className="border-t-4 border-t-(--color-primary)">
                <h3 className="text-sm font-bold text-(--color-text-primary) mb-3 flex items-center gap-2">
                  <Plus size={16} className="text-(--color-primary)" />
                  <span>Tedavi Planına Seans / İşlem Ekle</span>
                </h3>

                <form onSubmit={handleAddStep} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1">
                      İlişkili Diş
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-(--color-primary-muted) text-(--color-primary) font-mono font-bold text-xs border border-(--color-primary)/20">
                        {selectedTooth ? `#${selectedTooth} — ${TOOTH_NAMES[selectedTooth]}` : 'Diş Seçilmedi'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1">
                      Hazır İşlem Şablonu
                    </label>
                    <select
                      value={stepTemplateId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setStepTemplateId(id);
                        const t = PROCEDURE_TEMPLATES.find((p) => p.id === id);
                        if (t) setStepPrice(t.price);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) text-(--color-text-primary) outline-none focus:ring-2 focus:ring-(--color-primary)"
                    >
                      {PROCEDURE_TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.title} ({tpl.price.toLocaleString('tr-TR')} ₺ - {tpl.duration} dk)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1">
                        Ücret (₺)
                      </label>
                      <input
                        type="number"
                        value={stepPrice}
                        onChange={(e) => setStepPrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-(--color-bg-surface) border border-(--color-border-subtle) text-(--color-text-primary) outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-(--color-text-secondary) mb-1">
                        Uygulama Şekli
                      </label>
                      <select
                        value={stepMode}
                        onChange={(e) => setStepMode(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-(--color-bg-surface) border border-(--color-border-subtle) text-(--color-text-primary)"
                      >
                        <option value="scheduled_session">Sonraki Seans</option>
                        <option value="same_day_chairside">⚡ Koltukta Şimdi</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    fullWidth
                    disabled={!selectedTooth}
                    icon={<Plus size={14} />}
                  >
                    Plana Ekle
                  </Button>
                </form>
              </Card>

              {/* CURRENT TREATMENT PLAN LIST */}
              <Card padding="md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-(--color-border-subtle)">
                  <div>
                    <h3 className="text-sm font-bold text-(--color-text-primary)">
                      Oluşturulan Tedavi Planı
                    </h3>
                    <p className="text-[11px] text-(--color-text-muted)">
                      {steps.length} seans / işlem tanımlandı
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-(--color-text-muted) block">
                      Toplam Tutar
                    </span>
                    <span className="text-base font-bold font-mono text-(--color-primary)">
                      {totalPrice.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>

                {steps.length === 0 ? (
                  <p className="text-xs text-(--color-text-muted) text-center py-6">
                    Henüz tedavi planına bir adım eklenmedi.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {steps.map((st, idx) => (
                      <div
                        key={st.id}
                        className="p-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) flex items-center justify-between text-xs gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-(--color-primary) text-white text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-(--color-text-primary) truncate">
                              {st.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-(--color-text-muted)">
                            <span className="font-mono font-semibold text-(--color-primary)">
                              #{st.fdiNumber} Diş
                            </span>
                            <span>•</span>
                            <span>{st.durationMin} dk</span>
                            <span>•</span>
                            {st.executionMode === 'same_day_chairside' ? (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-0.5">
                                <Zap size={10} /> Koltukta Yapıldı
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 text-[10px]">
                                Sonraki Seans
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-(--color-text-primary)">
                            {st.price.toLocaleString('tr-TR')} ₺
                          </span>
                          <button
                            onClick={() => handleDeleteStep(st.id)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"
                            title="İşlemi Sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 4. VIEW 2: PATIENT PORTAL SIMULATOR (MOBILE PREVIEW) */}
      {/* ============================================================== */}
      {activeView === 'patient' && (
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
          <div className="text-center max-w-md mb-6">
            <h2 className="text-base font-bold text-(--color-text-primary)">
              📱 Hasta Gözünden Mobil Görünüm
            </h2>
            <p className="text-xs text-(--color-text-muted) mt-1">
              Hekimin FDI diş haritasında belirlediği seanslar, hastanın telefonundaki hasta portalında
              şu şekilde anlaşılır ve sade bir dille görünür:
            </p>
          </div>

          {/* Realistic Mobile Frame */}
          <div className="w-full max-w-sm rounded-[36px] border-8 border-slate-800 bg-white shadow-2xl overflow-hidden flex flex-col min-h-[640px]">
            {/* Phone Speaker & Camera Notch */}
            <div className="bg-slate-800 pt-2 pb-1.5 px-6 flex justify-between items-center text-white text-[10px]">
              <span className="font-mono font-bold">09:41</span>
              <div className="w-16 h-3 bg-slate-900 rounded-full" />
              <span>5G 100%</span>
            </div>

            {/* In-App Header */}
            <div className="p-4 bg-(--color-bg-surface) border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-(--color-primary) uppercase tracking-wider block">
                  DentaPanel Hasta Portalı
                </span>
                <h3 className="text-sm font-bold text-slate-900">{patientName}</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                AY
              </div>
            </div>

            {/* In-App Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50">
              {/* Doctor Memo */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Planlayan Hekim
                </span>
                <p className="text-xs font-bold text-slate-900">{doctorName}</p>
                <p className="text-[11px] text-slate-600 italic">
                  &ldquo;Muayenede tespit edilen diş çürükleri ve kanal tedavisi seansları planınıza eklenmiştir.&rdquo;
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Tedavi Seanslarım</span>
                  <span className="text-xs font-mono font-bold text-(--color-primary)">
                    {totalPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                {steps.map((st, idx) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {idx + 1}. Seans Adımı
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {st.price.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="font-mono font-semibold text-(--color-primary)">
                        İlgili Diş: #{st.fdiNumber} ({TOOTH_NAMES[st.fdiNumber]?.split(' ')[0]} {TOOTH_NAMES[st.fdiNumber]?.split(' ')[1]})
                      </span>
                      {st.executionMode === 'same_day_chairside' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ✓ Uygulandı
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                          Randevu Bekliyor
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to action */}
              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-(--color-primary) text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5"
              >
                <Calendar size={14} />
                <span>2. Seans Randevumu Belirle</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 5. VIEW 3: FULL CLINICAL MATRIX REPORT (TABLE & PRINT) */}
      {/* ============================================================== */}
      {activeView === 'matrix' && (
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <Card padding="md">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-(--color-border-subtle)">
              <div>
                <h2 className="text-base font-bold text-(--color-text-primary)">
                  Klinik Odontogram Döküm Raporu
                </h2>
                <p className="text-xs text-(--color-text-muted)">
                  Hasta: <strong>{patientName}</strong> • Hekim: <strong>{doctorName}</strong>
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-(--color-border-subtle) hover:bg-(--color-bg-elevated) text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} />
                <span>Yazdır / PDF Al</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-(--color-border-subtle) text-(--color-text-muted) uppercase text-[10px]">
                    <th className="py-2.5 px-3">FDI No</th>
                    <th className="py-2.5 px-3">Diş Adı</th>
                    <th className="py-2.5 px-3">Klinik Durum</th>
                    <th className="py-2.5 px-3">Klinik Not</th>
                    <th className="py-2.5 px-3">Planlanan Tedavi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border-subtle)">
                  {Object.keys(TOOTH_NAMES).map((numStr) => {
                    const num = Number(numStr);
                    const rec = teeth[num];
                    const info = rec ? CONDITIONS[rec.condition] : CONDITIONS.healthy;
                    const relatedStep = steps.find((s) => s.fdiNumber === num);

                    return (
                      <tr key={num} className={rec ? 'bg-teal-50/20' : ''}>
                        <td className="py-2 px-3 font-mono font-bold text-(--color-text-primary)">
                          #{num}
                        </td>
                        <td className="py-2 px-3 text-(--color-text-secondary)">
                          {TOOTH_NAMES[num]}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${info.bg} ${info.text} ${info.border}`}
                          >
                            {info.icon} {info.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-(--color-text-muted) italic">
                          {rec?.clinicalNote || '—'}
                        </td>
                        <td className="py-2 px-3 font-medium">
                          {relatedStep ? (
                            <span className="font-bold text-(--color-primary)">
                              {relatedStep.title} ({relatedStep.price.toLocaleString('tr-TR')} ₺)
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      )}

      {/* ============================================================== */}
      {/* 6. BOTTOM FOOTER WITH EXPLANATORY NOTES FOR CLIENTS */}
      {/* ============================================================== */}
      <footer className="mt-auto border-t border-(--color-border-subtle) bg-(--color-bg-surface) py-4 px-4 text-xs text-(--color-text-muted)">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-(--color-primary)" />
            <span>
              Bu ekran bağımsız bir <strong>Canlı Vitrindir</strong>; sisteme giriş veya veritabanı gerektirmeden çalışır.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/personel-giris"
              className="text-(--color-primary) font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Personel Girişine Git</span>
              <ChevronRight size={13} />
            </Link>
            <Link
              href="/giris"
              className="text-(--color-text-secondary) font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Hasta Girişine Git</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

