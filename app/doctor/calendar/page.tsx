'use client';

import { Badge } from '@/app/_components/ui/Badge';
import { Button } from '@/app/_components/ui/Button';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Tabs } from '@/app/_components/ui/Tabs';
import { mockAppointments, mockPatients } from '@/app/_lib/mock-data';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, MapPin, Clock, FileText, Plus, File, Sparkles } from 'lucide-react';
import { cn, formatDayName, getWeekDays } from '@/app/_lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30',
];

const TODAY_DATE = '2026-04-16';
const DOCTOR_ID  = 'doc-1';

const viewTabs = [
  { id: 'day',  label: 'Günlük' },
  { id: 'week', label: 'Haftalık' },
];

export default function DoctorCalendarPage() {
  const [view, setView]           = useState<'day' | 'week'>('day');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(TODAY_DATE);

  const weekDays = getWeekDays(weekOffset);
  const todayApts = mockAppointments.filter(
    a => a.doctorId === DOCTOR_ID && a.date === selectedDate
  );

  const aptByTime = Object.fromEntries(
    todayApts.map(a => [a.startTime, a])
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-(--color-border-subtle) bg-(--color-bg-surface) flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-(--color-text-primary)">Takvim</h1>
          <p className="text-xs text-(--color-text-muted)">
            {format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: tr })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs tabs={viewTabs} defaultTab="day" onChange={(id) => setView(id as 'day' | 'week')} variant="default" />
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" icon={<ChevronLeft size={14} />}
              onClick={() => setWeekOffset(o => o - 1)} aria-label="Geri" />
            <Button variant="outline" size="sm" onClick={() => { setWeekOffset(0); setSelectedDate(TODAY_DATE); }}>
              Bugün
            </Button>
            <Button variant="ghost" size="sm" icon={<ChevronRight size={14} />}
              onClick={() => setWeekOffset(o => o + 1)} aria-label="İleri" />
          </div>
          <Button size="sm" icon={<Plus size={14} />} id="new-appointment-btn">
            Randevu
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Week strip – always visible */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day selector strip */}
          <div className="flex border-b border-(--color-border-subtle) bg-(--color-bg-surface) px-6">
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = dateStr === selectedDate;
              const isToday    = dateStr === TODAY_DATE;
              const dayApts    = mockAppointments.filter(a => a.doctorId === DOCTOR_ID && a.date === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'flex-1 flex flex-col items-center py-3 transition-all duration-150 relative',
                    isSelected ? 'text-(--color-primary)' : 'text-(--color-text-muted) hover:text-(--color-text-secondary)'
                  )}
                >
                  <span className="text-[10px] font-medium uppercase mb-1">{formatDayName(day).slice(0, 3)}</span>
                  <span className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all',
                    isSelected && 'bg-(--color-primary) text-[hsl(222,47%,7%)]',
                    isToday && !isSelected && 'ring-2 ring-(--color-primary) text-(--color-primary)'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {/* Appointment dots */}
                  {dayApts.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayApts.slice(0, 3).map(a => (
                        <span key={a.id} className={cn(
                          'w-1 h-1 rounded-full',
                          a.type === 'online' ? 'bg-(--color-secondary)' : 'bg-(--color-primary)'
                        )} />
                      ))}
                    </div>
                  )}
                  {isSelected && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-(--color-primary) rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeline – Day view */}
          {view === 'day' && (
            <div className="flex-1 overflow-y-auto">
              <div className="grid" style={{ gridTemplateColumns: '52px 1fr' }}>
                {TIME_SLOTS.map((slot) => {
                  const apt = aptByTime[slot];
                  return (
                    <div key={slot} className="contents">
                      {/* Time label */}
                      <div className="px-3 py-2 text-[10px] text-(--color-text-muted) font-mono text-right border-b border-r border-(--color-border-subtle) flex items-start justify-end pt-3">
                        {slot}
                      </div>
                      {/* Slot cell */}
                      <div className="min-h-[60px] border-b border-(--color-border-subtle) px-3 py-1.5 group relative">
                        {apt ? (
                          <AppointmentBlock apt={apt} />
                        ) : (
                          <button className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="flex items-center gap-1 text-xs text-(--color-primary) bg-(--color-primary-muted) px-3 py-1 rounded-lg">
                              <Plus size={11} /> Randevu Ekle
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly view */}
          {view === 'week' && (
            <div className="flex-1 overflow-auto">
              <div className="grid min-w-[640px]" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
                {/* Time column + days header */}
                <div className="border-b border-r border-(--color-border-subtle)" />
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayApts = mockAppointments.filter(a => a.doctorId === DOCTOR_ID && a.date === dateStr);
                  return (
                    <div key={dateStr} className="border-b border-r border-(--color-border-subtle) px-2 py-2 text-center">
                      <p className="text-[10px] text-(--color-text-muted) uppercase">{formatDayName(day).slice(0, 3)}</p>
                      <p className="text-sm font-bold text-(--color-text-primary)">{format(day, 'd')}</p>
                      <p className="text-[10px] text-(--color-primary)">{dayApts.length} randevu</p>
                    </div>
                  );
                })}

                {/* Time slots */}
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="contents">
                    <div className="px-2 py-1 text-[10px] text-(--color-text-muted) font-mono border-b border-r border-(--color-border-subtle) flex items-center justify-end min-h-[44px]">
                      {slot}
                    </div>
                    {weekDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const apt = mockAppointments.find(a => a.doctorId === DOCTOR_ID && a.date === dateStr && a.startTime === slot);
                      return (
                        <div key={dateStr} className="border-b border-r border-(--color-border-subtle) px-1 py-0.5 min-h-[44px]">
                          {apt && (
                            <div className={cn(
                              'rounded-lg px-1.5 py-1 text-[10px] font-medium truncate',
                              apt.type === 'online'
                                ? 'bg-(--color-secondary-muted) text-(--color-secondary)'
                                : 'bg-(--color-primary-muted) text-(--color-primary)'
                            )}>
                              {apt.type === 'online' ? '📹' : '🏥'} Hasta
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel – Today's list */}
        <div className="w-72 border-l border-(--color-border-subtle) flex flex-col bg-(--color-bg-surface)">
          <div className="px-4 py-3 border-b border-(--color-border-subtle)">
            <p className="text-xs font-semibold text-(--color-text-secondary)">
              Seçili Gün — {todayApts.length} Randevu
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {todayApts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-(--color-text-muted)">Bu güne ait randevu yok</p>
              </div>
            ) : (
              todayApts.map((apt) => {
                const patient = mockPatients.find(p => p.id === apt.patientId);
                return (
                  <div key={apt.id} className="p-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) hover:border-(--color-border) transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar firstName={patient?.firstName} lastName={patient?.lastName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-(--color-text-primary) truncate">
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock size={9} className="text-(--color-text-muted)" />
                          <span className="text-[10px] text-(--color-text-muted) font-mono">{apt.startTime}</span>
                        </div>
                      </div>
                      <Badge status={apt.status} size="xs" dot />
                    </div>
                    <p className="text-[11px] text-(--color-text-muted) line-clamp-2 mb-2">
                      {apt.complaint ?? 'Şikayet belirtilmedi'}
                    </p>

                    {(apt.aiReport || (apt.documents && apt.documents.length > 0)) && (
                      <div className="mb-3 space-y-1.5">
                        {apt.documents && apt.documents.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {apt.documents.map((doc, i) => (
                              <div key={i} className="flex items-center gap-1 bg-(--color-bg-surface) px-1.5 py-0.5 rounded border border-(--color-border-subtle)">
                                <File size={8} className="text-(--color-secondary)" />
                                <span className="text-[9px] text-(--color-text-primary) max-w-[80px] truncate">{doc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {apt.aiReport && (
                          <div className="p-1.5 bg-linear-to-br from-primary/10 to-secondary/10 rounded border border-primary/20">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Sparkles size={9} className="text-(--color-primary)" />
                              <span className="text-[9px] font-bold text-(--color-primary) uppercase">AI Ön Analiz Raporu</span>
                            </div>
                            <p className="text-[10px] text-(--color-text-primary) italic leading-tight line-clamp-3">{apt.aiReport}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-1.5">
                      <Badge status={apt.type} size="xs" />
                      {apt.type === 'online' && (
                        <Button variant="primary" size="xs" icon={<Video size={10} />} className="flex-1">
                          Zoom Başlat
                        </Button>
                      )}
                      <Button variant="ghost" size="xs" icon={<FileText size={10} />} aria-label="Not Ekle" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Appointment block for timeline
function AppointmentBlock({ apt }: { apt: typeof mockAppointments[0] }) {
  const patient = mockPatients.find(p => p.id === apt.patientId);
  const isOnline = apt.type === 'online';

  return (
    <div className={cn(
      'rounded-xl p-2.5 border transition-all duration-200 hover:scale-[1.01] cursor-pointer',
      isOnline
        ? 'bg-(--color-secondary-muted) border-secondary/30'
        : 'bg-(--color-primary-muted) border-primary/30'
    )}>
      <div className="flex items-center gap-2">
        <Avatar firstName={patient?.firstName} lastName={patient?.lastName} size="xs" />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-xs font-semibold truncate',
            isOnline ? 'text-(--color-secondary)' : 'text-(--color-primary)'
          )}>
            {patient?.firstName} {patient?.lastName}
          </p>
          <p className="text-[10px] text-(--color-text-muted) truncate">{apt.complaint?.slice(0, 40)}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {isOnline && <Video size={11} className="text-(--color-secondary)" />}
          {!isOnline && <MapPin size={11} className="text-(--color-primary)" />}
          <Badge status={apt.status} size="xs" />
        </div>
      </div>
    </div>
  );
}
