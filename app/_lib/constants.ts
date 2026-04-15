// =====================================================
// SABİTLER — Hastane Paneli
// =====================================================

export const DEPARTMENTS = [
  { id: 'dep-1', name: 'Kardiyoloji', color: '#ef4444', icon: '❤️', tags: ['kalp', 'damar', 'ritim'] },
  { id: 'dep-2', name: 'Nöroloji', color: '#8b5cf6', icon: '🧠', tags: ['beyin', 'sinir', 'baş ağrısı'] },
  { id: 'dep-3', name: 'Ortopedi', color: '#f59e0b', icon: '🦴', tags: ['kemik', 'eklem', 'spor'] },
  { id: 'dep-4', name: 'Pediatri', color: '#10b981', icon: '👶', tags: ['çocuk', 'bebek', 'aşı'] },
  { id: 'dep-5', name: 'Dermatoloji', color: '#6366f1', icon: '🩺', tags: ['cilt', 'saç', 'tırnak'] },
  { id: 'dep-6', name: 'Göz Hastalıkları', color: '#14b8a6', icon: '👁️', tags: ['göz', 'retina', 'katarakt'] },
  { id: 'dep-7', name: 'KBB', color: '#f97316', icon: '👂', tags: ['kulak', 'burun', 'boğaz'] },
  { id: 'dep-8', name: 'Psikiyatri', color: '#ec4899', icon: '🧘', tags: ['ruh', 'anksiyete', 'depresyon'] },
  { id: 'dep-9', name: 'İç Hastalıkları', color: '#6b7280', icon: '🏥', tags: ['dahiliye', 'genel'] },
  { id: 'dep-10', name: 'Jinekoloji', color: '#e879f9', icon: '🌸', tags: ['kadın', 'doğum', 'üreme'] },
] as const;

export const DOCTOR_TITLES = [
  'Prof. Dr.',
  'Doç. Dr.',
  'Op. Dr.',
  'Uzm. Dr.',
  'Dr.',
] as const;

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'] as const;

export const APPOINTMENT_TYPES = [
  { value: 'face_to_face', label: 'Yüz Yüze' },
  { value: 'online', label: 'Online (Zoom)' },
] as const;

export const APPOINTMENT_DURATION_MINUTES = 30;

export const WORKING_HOURS = {
  start: '08:00',
  end:   '18:00',
} as const;

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
] as const;

export const WEEK_DAYS = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar',
] as const;

export const FAMILY_RELATIONS = [
  'Eş', 'Çocuk', 'Anne', 'Baba', 'Kardeş', 'Büyükanne', 'Büyükbaba', 'Diğer',
] as const;

export const ROOM_TYPES = [
  { value: 'polyclinic',    label: 'Poliklinik' },
  { value: 'operation',     label: 'Ameliyathane' },
  { value: 'intensive_care',label: 'Yoğun Bakım' },
  { value: 'examination',   label: 'Muayene Odası' },
] as const;

export const USER_ROLES = [
  { value: 'hospital_admin', label: 'Hastane Yöneticisi' },
  { value: 'doctor',         label: 'Doktor' },
  { value: 'secretary',      label: 'Sekreter' },
] as const;

// İptal/erteleme politikası
export const CANCELLATION_POLICY = {
  freeCancelHours: 24,
  rescheduleLimitHours: 12,
} as const;

export const NAV_ADMIN = [
  { href: '/admin/dashboard',      label: 'Dashboard',       icon: 'LayoutDashboard' },
  { href: '/admin/hospital-setup', label: 'Hastane Ayarları', icon: 'Building2' },
  { href: '/admin/departments',    label: 'Departmanlar',    icon: 'Layers' },
  { href: '/admin/staff',          label: 'Personel',        icon: 'Users' },
  { href: '/admin/rooms',          label: 'Odalar',          icon: 'DoorOpen' },
] as const;

export const NAV_DOCTOR = [
  { href: '/doctor/calendar', label: 'Takvim',       icon: 'CalendarDays' },
  { href: '/doctor/patients', label: 'Hastalarım',   icon: 'Users' },
  { href: '/doctor/profile',  label: 'Profilim',     icon: 'UserCircle' },
] as const;
