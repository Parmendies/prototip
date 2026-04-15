import AdminHeader from '../_components/AdminHeader';
import { Card, CardHeader } from '@/app/_components/ui/Card';
import { Badge } from '@/app/_components/ui/Badge';
import { mockDashboardStats, mockDepartments, mockAppointments, mockDoctors } from '@/app/_lib/mock-data';
import { formatRelativeTime } from '@/app/_lib/utils';
import type { Metadata } from 'next';
import {
  TrendingUp, Users, Calendar, Activity,
  Share2, Clock, CheckCircle, XCircle,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard' };

const { today, weeklyAppointments, topDepartments, socialMediaLeads, recentActivity } = mockDashboardStats;

const statCards = [
  {
    id: 'stat-appointments',
    title: 'Bugünkü Randevular',
    value: today.totalAppointments,
    change: '+12%',
    positive: true,
    icon: <Calendar size={16} />,
    color: 'var(--color-primary)',
    colorMuted: 'var(--color-primary-muted)',
  },
  {
    id: 'stat-occupancy',
    title: 'Doluluk Oranı',
    value: `%${today.occupancyRate}`,
    change: '+5%',
    positive: true,
    icon: <Activity size={16} />,
    color: 'var(--color-secondary)',
    colorMuted: 'var(--color-secondary-muted)',
  },
  {
    id: 'stat-new-patients',
    title: 'Yeni Hasta',
    value: today.newPatients,
    change: '+3',
    positive: true,
    icon: <Users size={16} />,
    color: 'var(--color-success)',
    colorMuted: 'var(--color-success-muted)',
  },
  {
    id: 'stat-online',
    title: 'Online Görüşme',
    value: today.onlineConsultations,
    change: '+2',
    positive: true,
    icon: <TrendingUp size={16} />,
    color: 'var(--color-accent)',
    colorMuted: 'var(--color-accent-muted)',
  },
];

const activityIcons: Record<string, React.ReactNode> = {
  new_patient: <Users size={14} className="text-[var(--color-success)]" />,
  appointment:  <Calendar size={14} className="text-[var(--color-primary)]" />,
  staff:        <Activity size={14} className="text-[var(--color-secondary)]" />,
};

export default function AdminDashboardPage() {
  const maxBar = Math.max(...weeklyAppointments.map((d) => d.count));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdminHeader
        title="Dashboard"
        subtitle="Çarşamba, 15 Nisan 2026 — Genel Bakış"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.id} className="animate-slide-up">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ background: `var(--color-primary-muted)`, color: card.color }}
                >
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${card.positive ? 'text-[var(--color-success)] bg-[var(--color-success-muted)]' : 'text-[var(--color-error)] bg-[var(--color-error-muted)]'}`}
                >
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-0.5">{card.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{card.title}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Weekly bar chart */}
          <Card className="col-span-2">
            <CardHeader title="Haftalık Randevu Grafiği" subtitle="Bu haftanın dağılımı" />
            <div className="flex items-end gap-2 mt-5 h-36">
              {weeklyAppointments.map((day) => {
                const height = (day.count / maxBar) * 100;
                const isToday = day.day === 'Çar';
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-[var(--color-text-muted)]">{day.count}</span>
                    <div className="w-full rounded-t-md transition-all duration-500 relative overflow-hidden"
                      style={{
                        height: `${height}%`,
                        minHeight: '8px',
                        background: isToday
                          ? 'linear-gradient(to top, var(--color-primary), var(--color-primary-light))'
                          : 'var(--color-bg-elevated)',
                      }}
                    >
                      {isToday && (
                        <div className="absolute inset-0 animate-pulse-glow rounded-t-md" />
                      )}
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Social media */}
          <Card>
            <CardHeader
              title="Sosyal Medya"
              subtitle="Lead dönüşüm oranı"
          icon={<Share2 size={14} />}
            />
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-muted)]">Instagram</span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{socialMediaLeads.instagram}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e1306c] to-[#833ab4] transition-all"
                  style={{ width: `${(socialMediaLeads.instagram / socialMediaLeads.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-muted)]">Telegram</span>
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">{socialMediaLeads.facebook}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1877f2] to-[#0866ff] transition-all"
                  style={{ width: `${(socialMediaLeads.facebook / socialMediaLeads.total) * 100}%` }}
                />
              </div>
              <div className="pt-2 divider">
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">Dönüşüm</span>
                  <span className="text-sm font-bold text-[var(--color-success)]">%{socialMediaLeads.conversionRate}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Top Departments */}
          <Card>
            <CardHeader title="Popüler Departmanlar" icon={<Activity size={14} />} />
            <div className="mt-4 space-y-3">
              {topDepartments.map((dept, i) => (
                <div key={dept.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[var(--color-text-secondary)]">{dept.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">%{dept.percentage}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${dept.percentage}%`,
                        background: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)', 'var(--color-accent)', 'var(--color-error)'][i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-2">
            <CardHeader title="Son Aktiviteler" subtitle="Gerçek zamanlı" icon={<Clock size={14} />} />
            <div className="mt-4 space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-[var(--color-border-subtle)] last:border-0">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0 mt-0.5">
                    {activityIcons[item.type]}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] flex-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[11px] text-[var(--color-text-muted)] shrink-0 pt-0.5">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Today's appointments quick view */}
        <Card>
          <CardHeader
            title="Bugünkü Randevular"
            subtitle={`${mockAppointments.filter(a => a.date === '2026-04-16').length} randevu planlandı`}
            icon={<Calendar size={14} />}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--color-border-subtle)]">
                  {['Hasta', 'Doktor', 'Saat', 'Tür', 'Durum'].map((h) => (
                    <th key={h} className="pb-2 pr-4 text-xs font-medium text-[var(--color-text-muted)] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {mockAppointments.filter(a => a.date === '2026-04-16').slice(0, 5).map((apt) => {
                  const doctor = mockDoctors.find(d => d.id === apt.doctorId);
                  return (
                    <tr key={apt.id} className="hover:bg-[var(--color-bg-elevated)] transition-colors">
                      <td className="py-2.5 pr-4 text-[var(--color-text-secondary)] whitespace-nowrap">
                        Hasta {apt.patientId.replace('pat-', '#')}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                        {doctor ? `${doctor.title} ${doctor.lastName}` : '-'}
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--color-text-muted)] whitespace-nowrap font-mono text-xs">
                        {apt.startTime}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <Badge status={apt.type} size="xs" />
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <Badge status={apt.status} dot size="xs" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
