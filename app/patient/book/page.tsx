'use client';

import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import { mockDoctors, mockDepartments } from '@/app/_lib/mock-data';
import { useState } from 'react';
import {
  Search, ChevronRight, ChevronLeft, Star,
  Video, MapPin, Check, Clock, UploadCloud, File, Sparkles
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';
import { TIME_SLOTS } from '@/app/_lib/constants';

const TOTAL_STEPS = 5;

const tags = ['Baş ağrısı', 'Göğüs ağrısı', 'Diz ağrısı', 'Nefes darlığı', 'Çarpıntı', 'Ateş', 'Yorgunluk', 'Sırt ağrısı'];

const mockCalendarDays = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 3, 16 + i); // April 16+
  return { date: d, slots: Math.floor(Math.random() * 8) + 1 };
});

export default function BookAppointmentPage() {
  const [step, setStep]               = useState(1);
  const [complaint, setComplaint]     = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
  const [selectedDay, setSelectedDay]   = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [aptType, setAptType]           = useState<'face_to_face' | 'online'>('face_to_face');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name);
      setUploadedDocs(prev => [...prev, ...fileNames]);
    }
  }

  function handleNextStep1() {
    setIsAiGenerating(true);
    // Simulate AI generation wait
    setTimeout(() => {
      setAiReport('Yapay zeka ön analizi: Hastanın belirtmiş olduğu şikayetler ve eklediği belgeler, ilgili uzman tarafından incelenmesi gereken akut bir tabloya işaret edebilir. Öncelikli olarak muayene önerilir.');
      setIsAiGenerating(false);
      setStep(2);
    }, 1500);
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  const matchedDoctors = selectedTags.length > 0
    ? mockDoctors.filter(d => {
        const dept = mockDepartments.find(dep => dep.id === d.departmentId);
        return dept?.tags.some(t => selectedTags.some(st => t.includes(st.toLowerCase().slice(0, 4))));
      })
    : mockDoctors;

  return (
    <div className="w-full">
               
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg-base)]/90 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => step > 1 && setStep(s => s - 1)}
            className={cn('text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-lg hover:bg-[var(--color-bg-elevated)]', step <= 1 && 'invisible')}
            aria-label="Geri"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {['Şikayetiniz', 'Doktor Seçin', 'Tarih Seçin', 'Saat Seçin', 'Onaylayın'][step - 1]}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Adım {step} / {TOTAL_STEPS}</p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-5">

        {/* STEP 1: Complaint */}
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Şikayetinizi anlatın</h2>
              <p className="text-sm text-[var(--color-text-muted)]">AI size en uygun doktoru bulacak</p>
            </div>
            <textarea
              id="complaint-input"
              placeholder="Örn: 3 gündür göğüs ağrısı ve nefes darlığı çekiyorum..."
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Veya semptom seçin:</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    id={`symptom-${tag.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all duration-150',
                      selectedTags.includes(tag)
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-medium'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border)]'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Upload */}
            <div className="mt-4">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Tahlil veya Görüntü Yükle (İsteğe bağlı):</p>
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[var(--color-border)] rounded-2xl cursor-pointer hover:border-[var(--color-primary)] transition-colors bg-[var(--color-bg-surface)]">
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud size={24} className="text-[var(--color-primary)]" />
                  <span className="text-sm font-medium text-[var(--color-text-muted)]">Belge Yüklemek İçin Tıklayın</span>
                </div>
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>

              {uploadedDocs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[var(--color-bg-elevated)] p-2.5 rounded-xl border border-[var(--color-border-subtle)]">
                      <File size={16} className="text-[var(--color-secondary)]" />
                      <span className="text-xs text-[var(--color-text-primary)] truncate flex-1">{doc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              id="step1-next"
              fullWidth
              onClick={handleNextStep1}
              disabled={(!complaint.trim() && selectedTags.length === 0) || isAiGenerating}
              iconRight={isAiGenerating ? undefined : <Sparkles size={16} />}
              size="lg"
              className="mt-4 gap-2"
            >
              {isAiGenerating ? 'AI Analizi Yapılıyor...' : 'Doktor Bul & Analiz Et'}
            </Button>
          </div>
        )}

        {/* STEP 2: Doctor selection */}
        {step === 2 && (
          <div className="space-y-3 animate-slide-up">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Doktor Seçin</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Şikayetinize göre önerilen doktorlar</p>
            </div>
            {mockDoctors.map(doctor => {
              const dept = mockDepartments.find(d => d.id === doctor.departmentId);
              const isSelected = selectedDoctor?.id === doctor.id;
              return (
                <button
                  key={doctor.id}
                  id={`doctor-card-${doctor.id}`}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all duration-150',
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)]'
                      : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border)]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar firstName={doctor.firstName} lastName={doctor.lastName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">
                          {doctor.title} {doctor.lastName}
                        </p>
                        {isSelected && <Check size={14} className="text-[var(--color-primary)] shrink-0" />}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{doctor.specialty}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-0.5">
                          <Star size={11} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                          <span className="text-xs font-semibold text-[var(--color-text-primary)]">{doctor.rating}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">({doctor.reviewCount})</span>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{doctor.experienceYears} yıl deneyim</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {dept && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${dept.color}22`, color: dept.color }}>
                        {dept.icon} {dept.name}
                      </span>
                    )}
                    {doctor.availableForOnline && (
                      <Badge variant="primary" size="xs">
                        <Video size={9} className="mr-0.5" /> Online
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
            <Button fullWidth size="lg" onClick={() => setStep(3)} disabled={!selectedDoctor} iconRight={<ChevronRight size={16} />}>
              Devam Et
            </Button>
          </div>
        )}

        {/* STEP 3: Date selection */}
        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Tarih Seçin</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Müsait günleri görebilirsiniz</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mockCalendarDays.map(({ date, slots }) => {
                const isSelected = selectedDay?.toDateString() === date.toDateString();
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDay(date)}
                    className={cn(
                      'flex flex-col items-center py-3 rounded-2xl border transition-all duration-150',
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)]'
                        : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border)]'
                    )}
                  >
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase">
                      {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </span>
                    <span className={cn(
                      'text-lg font-bold mt-0.5',
                      isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'
                    )}>
                      {date.getDate()}
                    </span>
                    <span className={cn(
                      'text-[9px] mt-0.5',
                      slots > 4 ? 'text-[var(--color-success)]' : slots > 1 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'
                    )}>
                      {slots} slot
                    </span>
                  </button>
                );
              })}
            </div>
            <Button fullWidth size="lg" onClick={() => setStep(4)} disabled={!selectedDay} iconRight={<ChevronRight size={16} />}>
              Devam Et
            </Button>
          </div>
        )}

        {/* STEP 4: Time slot */}
        {step === 4 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Saat Seçin</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {selectedDay?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
              </p>
            </div>

            {/* Appointment type */}
            <div className="grid grid-cols-2 gap-2">
              {(['face_to_face', 'online'] as const).map((type) => (
                <button
                  key={type}
                  id={`apt-type-${type}`}
                  onClick={() => setAptType(type)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-2xl border transition-all duration-150',
                    aptType === type
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                      : 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)]'
                  )}
                >
                  {type === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                  <span className="text-sm font-medium">{type === 'online' ? 'Online' : 'Yüz Yüze'}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.slice(0, 12).map(slot => {
                const isBooked = ['09:00', '10:30', '14:00'].includes(slot);
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    id={`time-slot-${slot}`}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150',
                      isBooked
                        ? 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)] opacity-40 cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                    )}
                  >
                    <Clock size={12} />
                    {slot}
                  </button>
                );
              })}
            </div>
            <Button fullWidth size="lg" onClick={() => setStep(5)} disabled={!selectedSlot} iconRight={<ChevronRight size={16} />}>
              Devam Et
            </Button>
          </div>
        )}

        {/* STEP 5: Confirm */}
        {step === 5 && selectedDoctor && selectedDay && selectedSlot && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Randevu Özeti</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Onaylamadan önce kontrol edin</p>
            </div>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Avatar firstName={selectedDoctor.firstName} lastName={selectedDoctor.lastName} size="lg" />
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">
                    {selectedDoctor.title} {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">{selectedDoctor.specialty}</p>
                </div>
              </div>
              <div className="space-y-3 pt-3 divider">
                <SummaryRow label="Tarih" value={selectedDay.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })} />
                <SummaryRow label="Saat" value={`${selectedSlot} – ${nextSlot(selectedSlot)}`} />
                <SummaryRow label="Tür" value={aptType === 'online' ? '🎥 Online (Zoom)' : '🏥 Yüz Yüze'} />
                {complaint && <SummaryRow label="Şikayet" value={complaint.slice(0, 80) + (complaint.length > 80 ? '...' : '')} />}
              </div>
              
              {aiReport && (
                <div className="mt-4 p-3 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-xl border border-[var(--color-primary)]/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} className="text-[var(--color-primary)]" />
                    <span className="text-xs font-bold text-[var(--color-primary)]">AI Ön Analiz Raporu</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed italic">&quot;{aiReport}&quot;</p>
                  {uploadedDocs.length > 0 && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 mt-2 font-medium">({uploadedDocs.length} belge eklendi)</p>
                  )}
                </div>
              )}
            </Card>

            {/* Policy note */}
            <div className="rounded-2xl bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20 p-3">
              <p className="text-xs text-[var(--color-warning)] font-medium mb-1">⚠️ İptal Politikası</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Randevunuzu, başlangıçtan 24 saat önceye kadar ücretsiz iptal edebilirsiniz.
                Erteleme için 12 saat kural geçerlidir.
              </p>
            </div>

            <Button
              id="confirm-appointment"
              fullWidth
              size="lg"
              icon={<Check size={16} />}
              onClick={() => alert('Randevu alındı! 🎉')}
            >
              Randevuyu Onayla
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-sm text-[var(--color-text-muted)] shrink-0">{label}</span>
      <span className="text-sm text-[var(--color-text-primary)] text-right">{value}</span>
    </div>
  );
}

function nextSlot(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  const totalMin = h * 60 + m + 30;
  return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}
