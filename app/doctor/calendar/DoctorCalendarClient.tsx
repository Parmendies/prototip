'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Tabs } from '@/app/_components/ui/Tabs';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn, formatDayName, getWeekDays, getStatusColor, getStatusLabel } from '@/app/_lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

interface AppointmentItem {
  id: string;
  patientId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  visitType: string;
  status: string;
  isEarlyArrival: boolean;
  complaintText: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

const viewTabs = [
  { id: 'day', label: 'Günlük' },
  { id: 'week', label: 'Haftalık' },
];

export default function DoctorCalendarClient({
  appointments,
  todayStr,
}: {
  appointments: AppointmentItem[];
  todayStr: string;
}) {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const weekDays = getWeekDays(weekOffset);

  const selectedDateApts = appointments.filter(
    (a) => a.appointmentDate === selectedDate
  );

  const aptByTime = Object.fromEntries(
    selectedDateApts.map((a) => [a.startTime.slice(0, 5), a])
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-(--color-bg-base)">
      {/* Header */}
      <div className="px-6 py-4 border-b border-(--color-border-subtle) bg-(--color-bg-surface) flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-(--color-text-primary)">Randevu Takvimi</h1>
          <p className="text-xs text-(--color-text-secondary) capitalize">
            {format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: tr })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs tabs={viewTabs} defaultTab="day" onChange={(id) => setView(id as 'day' | 'week')} variant="default" />
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeft size={16} />}
              onClick={() => setWeekOffset((o) => o - 1)}
              aria-label="Önceki Hafta"
              className="min-h-[40px] min-w-[40px] rounded-xl"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWeekOffset(0);
                setSelectedDate(todayStr);
              }}
              className="min-h-[40px] px-3.5 rounded-xl font-bold text-xs"
            >
              Bugün
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={16} />}
              onClick={() => setWeekOffset((o) => o + 1)}
              aria-label="Sonraki Hafta"
              className="min-h-[40px] min-w-[40px] rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day selector strip */}
          <div className="flex border-b border-(--color-border-subtle) bg-(--color-bg-surface) px-4">
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const dayApts = appointments.filter((a) => a.appointmentDate === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'flex-1 flex flex-col items-center py-2.5 transition-all duration-150 relative',
                    isSelected
                      ? 'text-(--color-primary)'
                      : 'text-(--color-text-muted) hover:text-(--color-text-secondary)'
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase mb-1">
                    {formatDayName(day).slice(0, 3)}
                  </span>
                  <span
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all',
                      isSelected && 'bg-(--color-primary) text-white',
                      isToday && !isSelected && 'ring-2 ring-(--color-primary) text-(--color-primary)'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayApts.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayApts.slice(0, 3).map((a) => (
                        <span key={a.id} className="w-1.5 h-1.5 rounded-full bg-(--color-primary)" />
                      ))}
                    </div>
                  )}
                  {isSelected && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-(--color-primary) rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {TIME_SLOTS.map((time) => {
              const apt = aptByTime[time];
              return (
                <div key={time} className="flex items-start gap-3 py-1.5 border-b border-(--color-border-subtle)/50">
                  <span className="w-12 text-xs font-mono tabular-nums font-bold text-(--color-text-secondary) pt-2">
                    {time}
                  </span>
                  <div className="flex-1 min-h-[44px]">
                    {apt ? (
                      <div className="p-3 rounded-xl bg-(--color-primary)/5 border border-(--color-primary)/20 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={apt.patient.firstName} lastName={apt.patient.lastName} size="sm" />
                          <div>
                            <p className="text-xs font-bold text-(--color-text-primary)">
                              {apt.patient.firstName} {apt.patient.lastName}
                            </p>
                            <p className="text-[11px] text-(--color-text-secondary)">
                              {apt.visitType === 'treatment_session' ? 'Tedavi Seansı' : 'İlk Muayene'} • {apt.durationMin} dk
                              {apt.complaintText && ` — "${apt.complaintText}"`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-[10px] font-bold", getStatusColor(apt.status))}>
                            {getStatusLabel(apt.status)}
                          </Badge>
                          <Link
                            href={`/doctor/examination/${apt.id}`}
                            className="inline-flex items-center justify-center min-h-[36px] px-3.5 py-1 rounded-lg bg-(--color-primary) text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                          >
                            İncele
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full min-h-[44px] border border-dashed border-(--color-border-subtle) rounded-xl flex items-center px-3 text-[11px] text-(--color-text-muted)">
                        Boş Randevu Slotu
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Day Sidebar */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-(--color-border-subtle) bg-(--color-bg-surface) flex flex-col">
          <div className="p-4 border-b border-(--color-border-subtle)">
            <h3 className="text-xs font-bold text-(--color-text-primary) uppercase tracking-wider">
              Günün Randevuları {selectedDateApts.length > 0 && <span className="font-mono tabular-nums font-bold text-(--color-primary)">({selectedDateApts.length})</span>}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedDateApts.length === 0 ? (
              <p className="text-xs text-(--color-text-muted) text-center py-6">
                Bu tarihte randevu bulunmuyor.
              </p>
            ) : (
              selectedDateApts.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border-subtle) space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-(--color-text-primary)">
                      {a.patient.firstName} {a.patient.lastName}
                    </span>
                    <span className="font-mono tabular-nums text-(--color-primary) font-bold text-xs">
                      {a.startTime.slice(0, 5)}
                    </span>
                  </div>
                  <p className="text-[11px] text-(--color-text-secondary) font-mono tabular-nums">
                    {a.patient.phone}
                  </p>
                  {a.complaintText && (
                    <p className="text-[11px] text-(--color-text-secondary) bg-(--color-bg-surface) p-2.5 rounded-lg border border-(--color-border-subtle)">
                      &ldquo;{a.complaintText}&rdquo;
                    </p>
                  )}
                  <Link
                    href={`/doctor/examination/${a.id}`}
                    className="flex items-center justify-center min-h-[38px] text-center w-full py-1.5 rounded-lg bg-(--color-primary)/10 text-(--color-primary) font-bold text-xs hover:bg-(--color-primary)/20 transition-colors"
                  >
                    Muayene Dosyasını Aç
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

