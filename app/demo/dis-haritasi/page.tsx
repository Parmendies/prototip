'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/app/_components/ui/Card';
import {
  RefreshCw,
  Plus,
  Trash2,
  Printer,
  Smartphone,
  Stethoscope,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Box,
  Square,
  MousePointerClick,
} from 'lucide-react';
import { ToothArch, type ToothPaint } from './ToothArch';

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

interface ConditionMeta extends ToothPaint {
  label: string;
  desc: string;
}

const CONDITIONS: Record<ToothConditionKey, ConditionMeta> = {
  healthy: {
    label: 'Sağlam',
    color: '#efe7d6',
    light: '#fffdf7',
    dark: '#d8ccb2',
    desc: 'Doğal ve sağlıklı diş dokusu.',
  },
  caries: {
    label: 'Çürük',
    color: '#e5484d',
    light: '#ff9fa2',
    dark: '#a8262b',
    desc: 'Kavite / çürük lezyonu mevcut.',
  },
  filling: {
    label: 'Dolgulu',
    color: '#2563eb',
    light: '#93b8fd',
    dark: '#1e40af',
    desc: 'Mevcut kompozit / amalgam restorasyon.',
  },
  root_canal: {
    label: 'Kanal Tedavili',
    color: '#f59e0b',
    light: '#fcd889',
    dark: '#b45309',
    desc: 'Endodontik tedavi (kök kanal dolgusu).',
  },
  implant: {
    label: 'İmplant',
    color: '#8b5cf6',
    light: '#c9b8fd',
    dark: '#5b21b6',
    desc: 'Kemik içi titanyum implant vidası.',
  },
  crown: {
    label: 'Kron / Kaplama',
    color: '#06b6d4',
    light: '#9ae8f5',
    dark: '#0e7490',
    desc: 'Zirkonyum / porselen kaplama protez.',
  },
  missing: {
    label: 'Eksik Diş',
    color: '#cbd5e1',
    light: '#f1f5f9',
    dark: '#94a3b8',
    missing: true,
    desc: 'Ağızda bulunmayan çekilmiş diş boşluğu.',
  },
  extraction_needed: {
    label: 'Çekim Gerekiyor',
    color: '#9f1239',
    light: '#e8507a',
    dark: '#5f0b22',
    desc: 'Kurtarılamaz diş, çekim endikasyonu.',
  },
};

function ConditionDot({ k, size = 10 }: { k: ToothConditionKey; size?: number }) {
  const c = CONDITIONS[k];
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: c.missing ? 'transparent' : `radial-gradient(circle at 35% 30%, ${c.light}, ${c.color})`,
        border: c.missing ? '1.5px dashed #94a3b8' : k === 'healthy' ? '1px solid #cbbd9f' : 'none',
      }}
    />
  );
}

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

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg bg-(--color-bg-surface) border border-(--color-border-subtle) text-(--color-text-primary) outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 transition';

export default function StandaloneDentalMapDemo() {
  const [activeView, setActiveView] = useState<'doctor' | 'patient' | 'matrix'>('doctor');
  const [currentScenario, setCurrentScenario] = useState<'case1' | 'case2' | 'empty'>('case1');
  const [tilted, setTilted] = useState(true);

  // State
  const [teeth, setTeeth] = useState<Record<number, ToothRecord>>(SCENARIO_1.teeth);
  const [steps, setSteps] = useState<TreatmentStep[]>(SCENARIO_1.steps);
  const [patientName, setPatientName] = useState(SCENARIO_1.patientName);
  const [doctorName, setDoctorName] = useState(SCENARIO_1.doctorName);

  // Selected tooth
  const [selectedTooth, setSelectedTooth] = useState<number | null>(16);
  const [editingNote, setEditingNote] = useState(SCENARIO_1.teeth[16].clinicalNote || '');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Treatment step form
  const [stepTemplateId, setStepTemplateId] = useState(PROCEDURE_TEMPLATES[0].id);
  const [stepPrice, setStepPrice] = useState(PROCEDURE_TEMPLATES[0].price);
  const [stepMode, setStepMode] = useState<'scheduled_session' | 'same_day_chairside'>('scheduled_session');

  function loadScenario(type: 'case1' | 'case2' | 'empty') {
    setCurrentScenario(type);
    if (type === 'case1') {
      setTeeth(SCENARIO_1.teeth);
      setSteps(SCENARIO_1.steps);
      setPatientName(SCENARIO_1.patientName);
      setDoctorName(SCENARIO_1.doctorName);
      setSelectedTooth(16);
      setEditingNote(SCENARIO_1.teeth[16].clinicalNote || '');
    } else if (type === 'case2') {
      setTeeth(SCENARIO_2.teeth);
      setSteps(SCENARIO_2.steps);
      setPatientName(SCENARIO_2.patientName);
      setDoctorName(SCENARIO_2.doctorName);
      setSelectedTooth(46);
      setEditingNote(SCENARIO_2.teeth[46].clinicalNote || '');
    } else {
      setTeeth({});
      setSteps([]);
      setPatientName('Yeni Muayene Hastası');
      setDoctorName('Dr. Dt. Mehmet Yılmaz');
      setSelectedTooth(null);
      setEditingNote('');
    }
    showToast('Örnek vaka yüklendi');
  }

  function handleSelectTooth(num: number) {
    setSelectedTooth(num);
    setEditingNote(teeth[num]?.clinicalNote || '');
  }

  function handleSetCondition(condition: ToothConditionKey) {
    if (!selectedTooth) return;
    setTeeth((prev) => ({
      ...prev,
      [selectedTooth]: {
        condition,
        clinicalNote: prev[selectedTooth]?.clinicalNote ?? editingNote.trim(),
        updatedAt: 'Şimdi',
      },
    }));
  }

  function handleSaveNote() {
    if (!selectedTooth) return;
    setTeeth((prev) => ({
      ...prev,
      [selectedTooth]: {
        condition: prev[selectedTooth]?.condition ?? 'healthy',
        clinicalNote: editingNote.trim(),
        updatedAt: 'Şimdi',
      },
    }));
    showToast(`#${selectedTooth} klinik notu kaydedildi`);
  }

  function handleAddStep(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTooth) return;
    const tpl = PROCEDURE_TEMPLATES.find((t) => t.id === stepTemplateId) || PROCEDURE_TEMPLATES[0];
    const newStep: TreatmentStep = {
      id: crypto.randomUUID(),
      fdiNumber: selectedTooth,
      title: tpl.title,
      price: Number(stepPrice) || tpl.price,
      durationMin: tpl.duration,
      executionMode: stepMode,
      status: stepMode === 'same_day_chairside' ? 'completed' : 'planned',
    };
    setSteps((prev) => [...prev, newStep]);
    showToast(`#${selectedTooth} için "${tpl.title}" plana eklendi`);
  }

  function handleDeleteStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    showToast('Tedavi adımı çıkarıldı');
  }

  function showToast(msg: string) {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2600);
  }

  const totalPrice = steps.reduce((sum, s) => sum + s.price, 0);
  const conditionOf = (num: number): ToothConditionKey => teeth[num]?.condition ?? 'healthy';
  const selectedRecord = selectedTooth ? teeth[selectedTooth] : undefined;
  const selectedCondition = selectedTooth ? conditionOf(selectedTooth) : 'healthy';
  const selectedSteps = selectedTooth ? steps.filter((s) => s.fdiNumber === selectedTooth) : [];
  const noteDirty = selectedTooth ? editingNote.trim() !== (selectedRecord?.clinicalNote ?? '') : false;

  const conditionCounts = Object.values(teeth).reduce<Partial<Record<ToothConditionKey, number>>>((acc, r) => {
    if (r.condition !== 'healthy') acc[r.condition] = (acc[r.condition] ?? 0) + 1;
    return acc;
  }, {});

  const tabs = [
    { key: 'doctor' as const, label: 'Hekim Paneli', icon: Stethoscope },
    { key: 'patient' as const, label: 'Hasta Portalı', icon: Smartphone },
    { key: 'matrix' as const, label: 'Klinik Rapor', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary) flex flex-col font-sans">
      {/* ============================================================== */}
      {/* HEADER */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-(--color-bg-surface)/90 backdrop-blur-md border-b border-(--color-border-subtle)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-(--color-primary) text-white flex items-center justify-center text-sm font-bold">
              D
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold tracking-tight truncate">
                  Denta<span className="text-(--color-primary)">Panel</span>
                  <span className="text-(--color-text-muted) font-normal"> · Diş Haritası</span>
                </h1>
                <span className="hidden sm:inline px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-(--color-primary-muted) text-(--color-primary)">
                  Demo
                </span>
              </div>
              <p className="text-xs text-(--color-text-muted) truncate">
                {patientName} · {doctorName}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center p-1 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle)">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  activeView === key
                    ? 'bg-(--color-bg-surface) text-(--color-text-primary) shadow-xs'
                    : 'text-(--color-text-muted) hover:text-(--color-text-primary)'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <select
              value={currentScenario}
              onChange={(e) => loadScenario(e.target.value as 'case1' | 'case2' | 'empty')}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-(--color-bg-surface) border border-(--color-border-subtle) outline-none cursor-pointer"
              aria-label="Örnek vaka"
            >
              <option value="case1">Vaka 1 · Dolgu & Kanal</option>
              <option value="case2">Vaka 2 · İmplant & Kaplama</option>
              <option value="empty">Boş Muayene</option>
            </select>
            <button
              onClick={() => loadScenario(currentScenario)}
              title="Vakayı sıfırla"
              className="w-8 h-8 rounded-lg border border-(--color-border-subtle) text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-elevated) flex items-center justify-center cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* mobile tabs */}
        <nav className="md:hidden flex border-t border-(--color-border-subtle)">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 ${
                activeView === key
                  ? 'border-(--color-primary) text-(--color-primary)'
                  : 'border-transparent text-(--color-text-muted)'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 1: DENTIST WORKSPACE */}
      {/* ============================================================== */}
      {activeView === 'doctor' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            {/* ARCH */}
            <Card padding="none" className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border-subtle)">
                <div>
                  <h2 className="text-sm font-semibold">Odontogram</h2>
                  <p className="text-xs text-(--color-text-muted)">FDI numaralandırma · İncelemek için bir dişe tıklayın</p>
                </div>
                <div className="flex items-center p-0.5 rounded-lg bg-(--color-bg-elevated) border border-(--color-border-subtle)">
                  <button
                    onClick={() => setTilted(true)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer ${
                      tilted ? 'bg-(--color-bg-surface) shadow-xs text-(--color-text-primary)' : 'text-(--color-text-muted)'
                    }`}
                  >
                    <Box size={12} /> 3D
                  </button>
                  <button
                    onClick={() => setTilted(false)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer ${
                      !tilted ? 'bg-(--color-bg-surface) shadow-xs text-(--color-text-primary)' : 'text-(--color-text-muted)'
                    }`}
                  >
                    <Square size={12} /> Düz
                  </button>
                </div>
              </div>

              <div className="relative px-4 sm:px-10 pt-4 pb-2 bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#f3f6f8_70%)]">
                <span className="absolute left-1/2 -translate-x-1/2 top-3 text-[10px] font-semibold tracking-[0.14em] text-(--color-text-muted) uppercase">
                  Üst Çene
                </span>
                <div className="max-w-[620px] mx-auto">
                  <ToothArch
                    paintFor={(n) => CONDITIONS[conditionOf(n)]}
                    selected={selectedTooth}
                    onSelect={handleSelectTooth}
                    tilted={tilted}
                  />
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-[10px] font-semibold tracking-[0.14em] text-(--color-text-muted) uppercase">
                  Alt Çene
                </span>
              </div>

              {/* Legend */}
              <div className="px-5 py-3 border-t border-(--color-border-subtle) flex flex-wrap gap-x-4 gap-y-2">
                {(Object.keys(CONDITIONS) as ToothConditionKey[]).map((k) => (
                  <span key={k} className="flex items-center gap-1.5 text-xs text-(--color-text-secondary)">
                    <ConditionDot k={k} />
                    {CONDITIONS[k].label}
                    {conditionCounts[k] ? (
                      <span className="text-[10px] font-semibold text-(--color-text-muted) tabular-nums">
                        {conditionCounts[k]}
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
            </Card>

            {/* DETAIL PANEL */}
            <Card padding="none" className="lg:sticky lg:top-24 overflow-hidden">
              {selectedTooth ? (
                <>
                  <div className="px-5 py-4 border-b border-(--color-border-subtle) flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) flex items-center justify-center font-semibold text-base tabular-nums">
                      {selectedTooth}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted) font-medium">
                        Diş #{selectedTooth}
                      </p>
                      <h3 className="text-sm font-semibold leading-snug">{TOOTH_NAMES[selectedTooth]}</h3>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <ConditionDot k={selectedCondition} />
                        <span className="font-medium">{CONDITIONS[selectedCondition].label}</span>
                        {selectedRecord?.updatedAt && (
                          <span className="text-(--color-text-muted)">· {selectedRecord.updatedAt}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="px-5 py-4 border-b border-(--color-border-subtle)">
                    <p className="text-xs font-semibold text-(--color-text-secondary) mb-2">Klinik Durum</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(CONDITIONS) as ToothConditionKey[]).map((k) => {
                        const active = selectedCondition === k;
                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => handleSetCondition(k)}
                            className={`px-2.5 py-2 rounded-lg border text-xs flex items-center gap-2 text-left transition cursor-pointer ${
                              active
                                ? 'border-(--color-primary) bg-(--color-primary-muted) font-semibold text-(--color-text-primary)'
                                : 'border-(--color-border-subtle) text-(--color-text-secondary) hover:bg-(--color-bg-elevated)'
                            }`}
                          >
                            <ConditionDot k={k} />
                            <span className="truncate">{CONDITIONS[k].label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-(--color-text-muted)">{CONDITIONS[selectedCondition].desc}</p>
                  </div>

                  {/* Note */}
                  <div className="px-5 py-4 border-b border-(--color-border-subtle)">
                    <p className="text-xs font-semibold text-(--color-text-secondary) mb-2">Klinik Not</p>
                    <textarea
                      rows={2}
                      placeholder="Örn: Oklüzal derin çürük, perküsyon +"
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      className={`${inputCls} resize-none`}
                    />
                    {noteDirty && (
                      <button
                        onClick={handleSaveNote}
                        className="mt-2 text-xs font-semibold text-(--color-primary) hover:underline cursor-pointer"
                      >
                        Notu kaydet
                      </button>
                    )}
                  </div>

                  {/* Tooth treatments */}
                  <div className="px-5 py-4 border-b border-(--color-border-subtle)">
                    <p className="text-xs font-semibold text-(--color-text-secondary) mb-2">
                      Bu Dişe Ait İşlemler
                    </p>
                    {selectedSteps.length === 0 ? (
                      <p className="text-xs text-(--color-text-muted)">Planlanmış işlem yok.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {selectedSteps.map((st) => (
                          <li key={st.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate">{st.title}</span>
                            <span className="font-semibold tabular-nums shrink-0">
                              {st.price.toLocaleString('tr-TR')} ₺
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Add treatment */}
                  <form onSubmit={handleAddStep} className="px-5 py-4 space-y-2.5 bg-(--color-bg-elevated)/60">
                    <p className="text-xs font-semibold text-(--color-text-secondary)">İşlem Ekle</p>
                    <select
                      value={stepTemplateId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setStepTemplateId(id);
                        const t = PROCEDURE_TEMPLATES.find((p) => p.id === id);
                        if (t) setStepPrice(t.price);
                      }}
                      className={inputCls}
                    >
                      {PROCEDURE_TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.title}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="number"
                          value={stepPrice}
                          onChange={(e) => setStepPrice(Number(e.target.value))}
                          className={`${inputCls} pr-7 tabular-nums`}
                          aria-label="Ücret"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-(--color-text-muted)">₺</span>
                      </div>
                      <select
                        value={stepMode}
                        onChange={(e) => setStepMode(e.target.value as 'scheduled_session' | 'same_day_chairside')}
                        className={inputCls}
                        aria-label="Uygulama şekli"
                      >
                        <option value="scheduled_session">Sonraki seans</option>
                        <option value="same_day_chairside">Koltukta şimdi</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-(--color-primary) hover:bg-(--color-primary-dark) text-white text-sm font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus size={15} /> Plana Ekle
                    </button>
                  </form>
                </>
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-(--color-bg-elevated) flex items-center justify-center text-(--color-text-muted) mb-3">
                    <MousePointerClick size={20} />
                  </div>
                  <p className="text-sm font-semibold">Diş seçilmedi</p>
                  <p className="text-xs text-(--color-text-muted) mt-1">
                    Detayları görmek için haritadan bir dişe tıklayın.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* TREATMENT PLAN */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--color-border-subtle)">
              <div>
                <h3 className="text-sm font-semibold">Tedavi Planı</h3>
                <p className="text-xs text-(--color-text-muted)">{steps.length} işlem</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-(--color-text-muted) font-medium">Toplam</p>
                <p className="text-lg font-semibold tabular-nums text-(--color-primary)">
                  {totalPrice.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>

            {steps.length === 0 ? (
              <p className="text-xs text-(--color-text-muted) text-center py-8">
                Henüz tedavi planına işlem eklenmedi.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-(--color-text-muted)">
                      <th className="px-5 py-2.5 font-medium w-10">#</th>
                      <th className="px-3 py-2.5 font-medium">Diş</th>
                      <th className="px-3 py-2.5 font-medium">İşlem</th>
                      <th className="px-3 py-2.5 font-medium">Süre</th>
                      <th className="px-3 py-2.5 font-medium">Durum</th>
                      <th className="px-3 py-2.5 font-medium text-right">Ücret</th>
                      <th className="px-5 py-2.5 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--color-border-subtle)">
                    {steps.map((st, idx) => (
                      <tr
                        key={st.id}
                        onClick={() => handleSelectTooth(st.fdiNumber)}
                        className={`cursor-pointer transition ${
                          selectedTooth === st.fdiNumber ? 'bg-(--color-primary-muted)/60' : 'hover:bg-(--color-bg-elevated)'
                        }`}
                      >
                        <td className="px-5 py-3 text-(--color-text-muted) tabular-nums">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
                            <ConditionDot k={conditionOf(st.fdiNumber)} size={8} />
                            {st.fdiNumber}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium">{st.title}</td>
                        <td className="px-3 py-3 text-(--color-text-muted) tabular-nums">{st.durationMin} dk</td>
                        <td className="px-3 py-3">
                          {st.executionMode === 'same_day_chairside' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                              <Zap size={10} /> Koltukta yapıldı
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                              Sonraki seans
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                          {st.price.toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStep(st.id);
                            }}
                            className="w-7 h-7 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                            title="İşlemi sil"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
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
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                            <ConditionDot k={rec ? rec.condition : 'healthy'} />
                            {info.label}
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

