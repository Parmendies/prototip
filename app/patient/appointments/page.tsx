'use client';

import { Card } from '@/app/_components/ui/Card';
import { Badge } from '@/app/_components/ui/Badge';
import { Button } from '@/app/_components/ui/Button';
import { Avatar } from '@/app/_components/ui/Avatar';
import { mockAppointments, mockDoctors, mockPatients } from '@/app/_lib/mock-data';
import { Tabs, useTabs } from '@/app/_components/ui/Tabs';
import { Video, MapPin, Clock, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { formatDate } from '@/app/_lib/utils';
import { cn } from '@/app/_lib/utils';

const patient = mockPatients[0];

const tabs = [
  { id: 'upcoming', label: 'Yaklaşan', badge: 3 },
  { id: 'past',     label: 'Geçmiş',  badge: 1 },
];

export default function PatientAppointmentsPage() {
  const { activeTab, setActiveTab } = useTabs(tabs, 'upcoming');

  const allApts = mockAppointments.filter(a => a.patientId === patient.id);
  const upcoming = allApts.filter(a => ['confirmed', 'pending'].includes(a.status));
  const past     = allApts.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status));

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="w-full">
      {/* Header */}
         <div>
        <div className="w-150" />
      </div>
      <div className="sticky top-0 z-20 bg-[var(--color-bg-base)]/90 backdrop-blur-xl px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Randevularım</h1>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
          Merhaba, {patient.firstName} 👋
        </p>
      </div>

      <div className="px-4 py-5">
        {/* Next appointment banner */}
      {upcoming[0] && (() => {
        const doctor = mockDoctors.find(d => d.id === upcoming[0].doctorId);
        return (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary-muted)] to-[var(--color-bg-elevated)] border border-[var(--color-primary)]/30 animate-slide-up">
            <p className="text-xs font-semibold text-[var(--color-primary)] mb-2 uppercase tracking-wide">Sonraki Randevu</p>
            <div className="flex items-center gap-3">
              <Avatar firstName={doctor?.firstName} lastName={doctor?.lastName} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">
                  {doctor?.title} {doctor?.lastName}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{doctor?.specialty}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-[var(--color-text-primary)] font-mono">{upcoming[0].startTime}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{upcoming[0].date.slice(5).replace('-', '/')}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {upcoming[0].type === 'online' && (
                <Button variant="primary" size="sm" icon={<Video size={12} />} className="flex-1">Zoom&apos;a Katıl</Button>
              )}
              <Button variant="outline" size="sm" className="flex-1">Yeniden Planla</Button>
            </div>
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="mb-5">
        <Tabs tabs={tabs} defaultTab="upcoming" onChange={setActiveTab} variant="underline" />
      </div>

      {/* List */}
      <div className="space-y-4">
        {displayed.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {activeTab === 'upcoming' ? 'Yaklaşan randevunuz yok' : 'Geçmiş randevu yok'}
            </p>
          </div>
        )}
        {displayed.map(apt => {
          const doctor = mockDoctors.find(d => d.id === apt.doctorId);
          const isUpcoming = ['confirmed', 'pending'].includes(apt.status);
          // 24h rule for cancel
          const aptDateTime = new Date(`${apt.date}T${apt.startTime}`);
          const hoursUntil  = (aptDateTime.getTime() - Date.now()) / 3600000;
          const canCancel   = hoursUntil > 24;
          const canReschedule = hoursUntil > 12;

          return (
            <Card key={apt.id} className="animate-slide-up">
              <div className="flex items-start gap-3 mb-3">
                <Avatar firstName={doctor?.firstName} lastName={doctor?.lastName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">
                    {doctor?.title} {doctor?.lastName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{doctor?.specialty}</p>
                </div>
                <Badge status={apt.status} dot size="xs" />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <DetailItem icon={<Clock size={12} />} value={`${apt.startTime} – ${apt.endTime}`} />
                <DetailItem icon={<span className="text-[10px]">📅</span>} value={formatDate(apt.date)} />
                <DetailItem
                  icon={apt.type === 'online' ? <Video size={12} /> : <MapPin size={12} />}
                  value={apt.type === 'online' ? 'Online' : 'Yüz Yüze'}
                />
                {apt.complaint && (
                  <DetailItem icon={<span className="text-[10px]">💬</span>} value={apt.complaint.slice(0, 20) + '...'} />
                )}
              </div>

              {/* Actions */}
              {isUpcoming && (
                <div className="flex gap-2 pt-3 divider">
                  {apt.type === 'online' && (
                    <Button variant="primary" size="xs" icon={<Video size={11} />} className="flex-1">Zoom</Button>
                  )}
                  {canReschedule && (
                    <Button variant="outline" size="xs" icon={<RefreshCw size={11} />} className="flex-1">Ertele</Button>
                  )}
                  {canCancel ? (
                    <Button variant="ghost" size="xs" icon={<XCircle size={11} />} className="text-[var(--color-error)]">
                      İptal
                    </Button>
                  ) : (
                    <Button variant="ghost" size="xs" className="text-[var(--color-text-muted)] text-[11px] cursor-default">
                      📞 Hastaneyi Arayın
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Floating book button */}
      <div className="sticky bottom-24 flex justify-center mt-6 px-4">
        <a href="/patient/book" id="float-book-btn" className="w-full max-w-xs">
          <Button fullWidth size="lg" icon={<ChevronRight size={16} />} className="shadow-[var(--shadow-glow-primary)]">
            Yeni Randevu Al
          </Button>
        </a>
      </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
      <span className="text-[var(--color-text-muted)] shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
