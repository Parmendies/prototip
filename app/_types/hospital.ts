// =====================================================
// TİP TANIMLARI — Hastane
// =====================================================

export type HospitalStatus = 'active' | 'inactive' | 'pending';

export interface Hospital {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  vision?: string;
  mission?: string;
  status: HospitalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  tags: string[];
  doctorCount: number;
  color: string; // CSS renk değeri
  icon?: string;
  isActive: boolean;
}

export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type RoomType = 'polyclinic' | 'operation' | 'intensive_care' | 'examination';

export interface Room {
  id: string;
  hospitalId: string;
  departmentId: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  capacity: number;
  equipment?: string[];
  assignedDoctorId?: string;
}

export interface WorkingHours {
  day: 'pazartesi' | 'salı' | 'çarşamba' | 'perşembe' | 'cuma' | 'cumartesi' | 'pazar';
  isOpen: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
}
