'use client';

import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import { mockDoctors, mockDepartments } from '@/app/_lib/mock-data';
import { useState } from 'react';
import {
  ChevronRight, ChevronLeft, Star,
  Video, MapPin, Check, Clock, UploadCloud, File, Sparkles
} from 'lucide-react';
import { cn } from '@/app/_lib/utils';
import { TIME_SLOTS } from '@/app/_lib/constants';
import { generateMedicalReport } from './actions';

const TOTAL_STEPS = 5;

const tags = ['Baş ağrısı', 'Göğüs ağrısı', 'Diz ağrısı', 'Nefes darlığı', 'Çarpıntı', 'Ateş', 'Yorgunluk', 'Sırt ağrısı'];

const mockCalendarDays = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 3, 16 + i); // April 16+
  return { date: d, slots: Math.floor(Math.random() * 8) + 1 };
});

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [complaint, setComplaint] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [aptType, setAptType] = useState<'face_to_face' | 'online'>('face_to_face');
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [recommendedDoctorId, setRecommendedDoctorId] = useState<string | null>(null);

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedDocs(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  }

  async function handleNextStep1() {
    setIsAiGenerating(true);
    try {
      const formData = new FormData();
      formData.append('complaint', complaint);
      formData.append('selectedTags', JSON.stringify(selectedTags));

      uploadedDocs.forEach(doc => {
        formData.append('files', doc);
      });

      const response = await generateMedicalReport(formData);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      const aiData = response.data;
      setAiReport(aiData.report);

      if (aiData.recommendedDoctorId) {
        setRecommendedDoctorId(aiData.recommendedDoctorId);
        const doc = mockDoctors.find(d => d.id === aiData.recommendedDoctorId);
        if (doc) setSelectedDoctor(doc);
      }

      setStep(2);
    } catch (error: any) {
      console.error(error);
      alert("AI analizi sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsAiGenerating(false);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }


  return (
    <div className="w-full">
      <div className="w-150" />
      {/* Header */}
      <div className="sticky top-0 z-20 bg-(--color-bg-base)/90 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-(--color-border-subtle)">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => step > 1 && setStep(s => s - 1)}
            className={cn('text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors p-1 rounded-lg hover:bg-(--color-bg-elevated)', step <= 1 && 'invisible')}
            aria-label="Geri"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-(--color-text-primary)">
              {['Şikayetiniz', 'Doktor Seçin', 'Tarih Seçin', 'Saat Seçin', 'Onaylayın'][step - 1]}
            </p>
            <p className="text-[10px] text-(--color-text-muted)">Adım {step} / {TOTAL_STEPS}</p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-(--color-bg-elevated)">
          <div
            className="h-full rounded-full bg-linear-to-r from-(--color-primary) to-(--color-secondary) transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 py-5">

        {/* STEP 1: Complaint */}
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h2 className="text-lg font-bold text-(--color-text-primary) mb-1">Şikayetinizi anlatın</h2>
              <p className="text-sm text-(--color-text-muted)">AI size en uygun doktoru bulacak</p>
            </div>
            <textarea
              id="complaint-input"
              placeholder="Örn: 3 gündür göğüs ağrısı ve nefes darlığı çekiyorum..."
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm rounded-2xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-primary) resize-none"
            />
            <div>
              <p className="text-xs font-medium text-(--color-text-secondary) mb-2">Veya semptom seçin:</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    id={`symptom-${tag.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm border transition-all duration-150',
                      selectedTags.includes(tag)
                        ? 'border-(--color-primary) bg-(--color-primary-muted) text-(--color-primary) font-medium'
                        : 'border-(--color-border) text-(--color-text-muted) hover:border-(--color-border)'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Upload */}
            <div className="mt-4">
              <p className="text-xs font-medium text-(--color-text-secondary) mb-2">Tahlil veya Görüntü Yükle (İsteğe bağlı):</p>
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-(--color-border) rounded-2xl cursor-pointer hover:border-(--color-primary) transition-colors bg-(--color-bg-surface)">
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud size={24} className="text-(--color-primary)" />
                  <span className="text-sm font-medium text-(--color-text-muted)">Belge Yüklemek İçin Tıklayın</span>
                </div>
                <input type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
              </label>

              {uploadedDocs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 bg-(--color-bg-elevated) p-2.5 rounded-xl border border-(--color-border-subtle)">
                      <File size={16} className="text-(--color-secondary)" />
                      <span className="text-xs text-(--color-text-primary) truncate flex-1">{doc.name}</span>
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
              <h2 className="text-lg font-bold text-(--color-text-primary) mb-1">Doktor Seçin</h2>
              <p className="text-sm text-(--color-text-muted)">Şikayetinize göre önerilen doktorlar</p>
            </div>
            {mockDoctors.map((doctor) => {
              const dept = mockDepartments.find(d => d.id === doctor.departmentId);
              const isSelected = selectedDoctor?.id === doctor.id;
              const isAiRecommended = recommendedDoctorId === doctor.id;

              return (
                <button
                  key={doctor.id}
                  id={`doctor-card-${doctor.id}`}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all duration-150',
                    isSelected
                      ? 'border-(--color-primary) bg-(--color-primary-muted)'
                      : 'border-(--color-border-subtle) bg-(--color-bg-surface) hover:border-(--color-border)'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar firstName={doctor.firstName} lastName={doctor.lastName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-(--color-text-primary) truncate">
                          {doctor.title} {doctor.lastName}
                        </p>
                        {isAiRecommended && (
                          <span className="flex items-center text-[10px] font-bold bg-(--color-primary-muted) text-(--color-primary) px-1.5 py-0.5 rounded-md gap-0.5 border border-(--color-primary)/20">
                            <Sparkles size={10} /> AI Önerisi
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-(--color-primary) shrink-0 ml-auto" />}
                      </div>
                      <p className="text-xs text-(--color-text-muted) truncate">{doctor.specialty}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-0.5">
                          <Star size={11} className="text-(--color-accent) fill-(--color-accent)" />
                          <span className="text-xs font-semibold text-(--color-text-primary)">{doctor.rating}</span>
                          <span className="text-[10px] text-(--color-text-muted)">({doctor.reviewCount})</span>
                        </div>
                        <span className="text-[10px] text-(--color-text-muted)">{doctor.experienceYears} yıl deneyim</span>
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
              <h2 className="text-lg font-bold text-(--color-text-primary) mb-1">Tarih Seçin</h2>
              <p className="text-sm text-(--color-text-muted)">Müsait günleri görebilirsiniz</p>
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
                        ? 'border-(--color-primary) bg-(--color-primary-muted)'
                        : 'border-(--color-border-subtle) bg-(--color-bg-surface) hover:border-(--color-border)'
                    )}
                  >
                    <span className="text-[10px] text-(--color-text-muted) uppercase">
                      {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </span>
                    <span className={cn(
                      'text-lg font-bold mt-0.5',
                      isSelected ? 'text-(--color-primary)' : 'text-(--color-text-primary)'
                    )}>
                      {date.getDate()}
                    </span>
                    <span className={cn(
                      'text-[9px] mt-0.5',
                      slots > 4 ? 'text-(--color-success)' : slots > 1 ? 'text-(--color-warning)' : 'text-(--color-error)'
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
              <h2 className="text-lg font-bold text-(--color-text-primary) mb-1">Saat Seçin</h2>
              <p className="text-sm text-(--color-text-muted)">
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
                      ? 'border-(--color-primary) bg-(--color-primary-muted) text-(--color-primary)'
                      : 'border-(--color-border-subtle) text-(--color-text-muted)'
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
                        ? 'border-(--color-border-subtle) text-(--color-text-muted) opacity-40 cursor-not-allowed line-through'
                        : isSelected
                          ? 'border-(--color-primary) bg-(--color-primary-muted) text-(--color-primary)'
                          : 'border-(--color-border) text-(--color-text-secondary) hover:border-(--color-primary) hover:text-(--color-primary)'
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
              <h2 className="text-lg font-bold text-(--color-text-primary) mb-1">Randevu Özeti</h2>
              <p className="text-sm text-(--color-text-muted)">Onaylamadan önce kontrol edin</p>
            </div>

            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Avatar firstName={selectedDoctor.firstName} lastName={selectedDoctor.lastName} size="lg" />
                <div>
                  <p className="font-bold text-(--color-text-primary)">
                    {selectedDoctor.title} {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </p>
                  <p className="text-sm text-(--color-text-muted)">{selectedDoctor.specialty}</p>
                </div>
              </div>
              <div className="space-y-3 pt-3 divider">
                <SummaryRow label="Tarih" value={selectedDay.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })} />
                <SummaryRow label="Saat" value={`${selectedSlot} – ${nextSlot(selectedSlot)}`} />
                <SummaryRow label="Tür" value={aptType === 'online' ? '🎥 Online (Zoom)' : '🏥 Yüz Yüze'} />
                {complaint && <SummaryRow label="Şikayet" value={complaint.slice(0, 80) + (complaint.length > 80 ? '...' : '')} />}
              </div>

              {aiReport && (
                <div className="mt-4 p-3 bg-linear-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} className="text-(--color-primary)" />
                    <span className="text-xs font-bold text-(--color-primary)">AI Ön Analiz Raporu</span>
                  </div>
                  <p className="text-xs text-(--color-text-primary) leading-relaxed italic">&quot;{aiReport}&quot;</p>
                  {uploadedDocs.length > 0 && (
                    <p className="text-xs text-(--color-text-muted) mt-2 font-medium">({uploadedDocs.length} belge eklendi)</p>
                  )}
                </div>
              )}
            </Card>

            {/* Policy note */}
            <div className="rounded-2xl bg-(--color-warning-muted) border border-warning/20 p-3">
              <p className="text-xs text-(--color-warning) font-medium mb-1">⚠️ İptal Politikası</p>
              <p className="text-xs text-(--color-text-muted)">
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
      <span className="text-sm text-(--color-text-muted) shrink-0">{label}</span>
      <span className="text-sm text-(--color-text-primary) text-right">{value}</span>
    </div>
  );
}

function nextSlot(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  const totalMin = h * 60 + m + 30;
  return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}
