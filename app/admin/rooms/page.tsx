'use client';

import AdminHeader from '../_components/AdminHeader';
import { Card } from '@/app/_components/ui/Card';
import { Button } from '@/app/_components/ui/Button';
import { Badge } from '@/app/_components/ui/Badge';
import { Modal } from '@/app/_components/ui/Modal';
import { Input } from '@/app/_components/ui/Input';
import { mockRooms, mockDepartments } from '@/app/_lib/mock-data';
import { useState } from 'react';
import { Plus, DoorOpen } from 'lucide-react';
import { cn, getStatusLabel } from '@/app/_lib/utils';
import type { Room, RoomStatus } from '@/app/_types/hospital';

const statusColor: Record<RoomStatus, string> = {
  available:   'border-(--color-success)/40 bg-(--color-success-muted)',
  occupied:    'border-(--color-error)/40 bg-(--color-error-muted)',
  maintenance: 'border-(--color-warning)/40 bg-(--color-warning-muted)',
};

const roomTypeLabel: Record<string, string> = {
  polyclinic:    'Poliklinik',
  operation:     'Ameliyathane',
  intensive_care:'Yoğun Bakım',
  examination:   'Muayene',
};

// Group rooms by floor
function groupByFloor(rooms: Room[]) {
  const map = new Map<number, Room[]>();
  rooms.forEach(r => {
    if (!map.has(r.floor)) map.set(r.floor, []);
    map.get(r.floor)!.push(r);
  });
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [showModal, setShowModal] = useState(false);
  const floors = groupByFloor(rooms);

  const counts = {
    available:   rooms.filter(r => r.status === 'available').length,
    occupied:    rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AdminHeader title="Oda & Mekan Yönetimi" subtitle="Poliklinik ve muayene odalarını düzenleyin" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {([
            { k: 'available',   label: 'Müsait',  emoji: '🟢' },
            { k: 'occupied',    label: 'Dolu',    emoji: '🔴' },
            { k: 'maintenance', label: 'Bakımda', emoji: '🟡' },
          ] as const).map(({ k, label, emoji }) => (
            <Card key={k}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="text-xl font-bold text-(--color-text-primary)">{counts[k]}</p>
                  <p className="text-xs text-(--color-text-muted)">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Top action */}
        <div className="flex justify-end mb-4">
          <Button id="add-room-btn" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Oda Ekle</Button>
        </div>

        {/* Floors */}
        <div className="space-y-6">
          {floors.map(([floor, floorRooms]) => (
            <div key={floor}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-(--color-bg-elevated) flex items-center justify-center text-xs font-bold text-(--color-text-secondary)">
                  {floor}
                </div>
                <h3 className="text-sm font-semibold text-(--color-text-secondary)">
                  {floor === 0 ? 'Zemin Kat' : `${floor}. Kat`}
                </h3>
                <div className="flex-1 h-px bg-(--color-border-subtle)" />
                <span className="text-xs text-(--color-text-muted)">{floorRooms.length} oda</span>
              </div>

              <div className="grid grid-cols-3 xl:grid-cols-5 gap-3">
                {floorRooms.map((room) => {
                  const dept = mockDepartments.find(d => d.id === room.departmentId);
                  return (
                    <button
                      key={room.id}
                      id={`room-${room.id}`}
                      className={cn(
                        'rounded-2xl border p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
                        statusColor[room.status]
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <DoorOpen size={16} className="text-(--color-text-muted)" />
                        <Badge status={room.status} size="xs" />
                      </div>
                      <p className="text-base font-bold text-(--color-text-primary)">{room.number}</p>
                      <p className="text-[10px] text-(--color-text-muted) mt-0.5">{roomTypeLabel[room.type]}</p>
                      {dept && (
                        <p className="text-[10px] mt-1 font-medium" style={{ color: dept.color }}>
                          {dept.icon} {dept.name}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Oda Ekle"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>İptal</Button>
            <Button onClick={() => setShowModal(false)}>Ekle</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input id="room-number" label="Oda No" placeholder="Örn: 101" required />
          <Input id="room-floor" label="Kat" type="number" placeholder="1" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--color-text-secondary)">Oda Tipi</label>
            <select className="px-3.5 py-2.5 text-sm rounded-xl border border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary)">
              <option value="polyclinic">Poliklinik</option>
              <option value="examination">Muayene Odası</option>
              <option value="operation">Ameliyathane</option>
              <option value="intensive_care">Yoğun Bakım</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--color-text-secondary)">Departman</label>
            <select className="px-3.5 py-2.5 text-sm rounded-xl border border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary)">
              {mockDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Input id="room-capacity" label="Kapasite" type="number" placeholder="1" defaultValue="1" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--color-text-secondary)">Durum</label>
            <select className="px-3.5 py-2.5 text-sm rounded-xl border border-(--color-border) bg-(--color-bg-elevated) text-(--color-text-primary) focus:outline-none focus:border-(--color-primary)">
              <option value="available">Müsait</option>
              <option value="occupied">Dolu</option>
              <option value="maintenance">Bakımda</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
