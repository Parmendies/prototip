// =====================================================
// TİP TANIMLARI — Randevular
// =====================================================

export type AppointmentStatus =
  | 'pending'      // Onay bekliyor
  | 'confirmed'    // Onaylandı
  | 'in_progress'  // Devam ediyor
  | 'completed'    // Tamamlandı
  | 'cancelled'    // İptal edildi
  | 'no_show';     // Gelmedi

export type AppointmentType = 'face_to_face' | 'online';

export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  isAvailable: boolean;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  hospitalId: string;
  doctorId: string;
  patientId: string;
  departmentId: string;
  date: string;       // "2026-04-20"
  startTime: string;  // "09:00"
  endTime: string;    // "09:30"
  type: AppointmentType;
  status: AppointmentStatus;
  complaint?: string;   // Hastanın şikayeti
  note?: string;        // Doktor notu
  prescription?: string;
  zoomLink?: string;
  roomId?: string;
  documents?: string[]; // Yüklenen belgeler
  aiReport?: string;    // AI ön raporu
  createdAt: string;
  updatedAt: string;
  // Yüklenmiş veriler (populate edilmiş)
  doctor?: import('./user').Doctor;
  patient?: import('./user').Patient;
}

export interface DoctorSchedule {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
  blockedTimes?: { start: string; end: string; reason?: string }[];
}

export interface AppointmentSummary {
  total: number;
  confirmed: number;
  pending: number;
  completed: number;
  cancelled: number;
  noShow: number;
}
