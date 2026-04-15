'use client';

import AdminHeader from '../_components/AdminHeader';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Input } from '@/app/_components/ui/Input';
import { Avatar } from '@/app/_components/ui/Avatar';
import { Tabs } from '@/app/_components/ui/Tabs';
import { Modal } from '@/app/_components/ui/Modal';
import { mockDoctors, mockStaff, mockDepartments } from '@/app/_lib/mock-data';
import { useState } from 'react';
import { Search, Plus, Star, Video, Pencil, MoreHorizontal } from 'lucide-react';
import { getRoleLabel } from '@/app/_lib/utils';

const tabs = [
  { id: 'doctors',    label: 'Doktorlar',  badge: mockDoctors.length },
  { id: 'secretaries', label: 'Sekreterler', badge: mockStaff.filter(s => s.role === 'secretary').length },
];

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredDoctors = mockDoctors.filter(d =>
    `${d.firstName} ${d.lastName} ${d.specialty}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSecretary = mockStaff.filter(s =>
    s.role === 'secretary' &&
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdminHeader title="Personel Yönetimi" subtitle="Doktor ve sekreter kadrosunu yönetin" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <Tabs tabs={tabs} defaultTab="doctors" onChange={setActiveTab} variant="pills" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="İsim veya uzmanlık ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] w-56"
              />
            </div>
            <Button id="add-staff-btn" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>
              {activeTab === 'doctors' ? 'Doktor Ekle' : 'Sekreter Ekle'}
            </Button>
          </div>
        </div>

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => {
              const dept = mockDepartments.find(d => d.id === doctor.departmentId);
              return (
                <Card key={doctor.id} hover className="animate-slide-up">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar firstName={doctor.firstName} lastName={doctor.lastName} size="md" online />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                          {doctor.title} {doctor.firstName} {doctor.lastName}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{doctor.specialty}</p>
                    </div>
                    <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1" aria-label="Seçenekler">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {/* Dept badge */}
                  {dept && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-sm">{dept.icon}</span>
                      <span className="text-xs" style={{ color: dept.color }}>{dept.name}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center py-1.5 rounded-lg bg-[var(--color-bg-elevated)]">
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{doctor.experienceYears}</p>
                      <p className="text-[9px] text-[var(--color-text-muted)]">Yıl Deneyim</p>
                    </div>
                    <div className="text-center py-1.5 rounded-lg bg-[var(--color-bg-elevated)]">
                      <div className="flex items-center justify-center gap-0.5">
                        <Star size={10} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{doctor.rating}</p>
                      </div>
                      <p className="text-[9px] text-[var(--color-text-muted)]">{doctor.reviewCount} yorum</p>
                    </div>
                    <div className="text-center py-1.5 rounded-lg bg-[var(--color-bg-elevated)]">
                      {doctor.availableForOnline ? (
                        <div className="flex items-center justify-center">
                          <Video size={12} className="text-[var(--color-primary)]" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="text-[var(--color-text-muted)] text-[10px]">—</span>
                        </div>
                      )}
                      <p className="text-[9px] text-[var(--color-text-muted)]">Online</p>
                    </div>
                  </div>

                  {/* Room */}
                  {doctor.roomNumber && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mb-3">
                      📍 {doctor.floor}. Kat — Oda {doctor.roomNumber}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="pt-3 divider flex gap-2">
                    <Button variant="outline" size="xs" icon={<Pencil size={11} />} className="flex-1">
                      Düzenle
                    </Button>
                    <Badge status={doctor.status} dot size="xs" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Secretary Tab */}
        {activeTab === 'secretaries' && (
          <div className="space-y-3">
            {filteredSecretary.map((staff) => (
              <Card key={staff.id}>
                <div className="flex items-center gap-4">
                  <Avatar firstName={staff.firstName} lastName={staff.lastName} size="md" online />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {staff.firstName} {staff.lastName}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{getRoleLabel(staff.role)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {staff.permissions.slice(0, 3).map((p) => (
                      <Badge key={p} variant="outline" size="xs">{p.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                  <Badge status={staff.status} dot size="sm" />
                  <Button variant="ghost" size="xs" icon={<Pencil size={12} />}>Düzenle</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Yeni Personel Ekle"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>İptal</Button>
            <Button onClick={() => setShowModal(false)}>Ekle</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input id="staff-first-name" label="Ad" placeholder="Ad" required />
          <Input id="staff-last-name" label="Soyad" placeholder="Soyad" required />
          <Input id="staff-email" label="E-posta" type="email" placeholder="ornek@hastane.com" required />
          <Input id="staff-phone" label="Telefon" type="tel" placeholder="+90 5xx xxx xx xx" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Rol</label>
            <select className="px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]">
              <option value="doctor">Doktor</option>
              <option value="secretary">Sekreter</option>
              <option value="hospital_admin">Yönetici</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Departman</label>
            <select className="px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]">
              {mockDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Input id="staff-title" label="Ünvan (Doktor için)" placeholder="Prof. Dr., Uzm. Dr..." />
          <Input id="staff-specialty" label="Uzmanlık" placeholder="Örn: Kardiyoloji" />
          <Input id="staff-room" label="Oda No" placeholder="Örn: 101" />
          <Input id="staff-floor" label="Kat" type="number" placeholder="1" />
        </div>
      </Modal>
    </div>
  );
}
