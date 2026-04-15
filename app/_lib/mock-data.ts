import type { Hospital, Department, Room } from '@/app/_types/hospital';
import type { Doctor, Staff, Patient } from '@/app/_types/user';
import type { Appointment } from '@/app/_types/appointment';

// =====================================================
// MOCK DATA — Gerçekçi Türkçe Veriler
// =====================================================

// --- Hastane ---
export const mockHospital: Hospital = {
  id: 'hosp-1',
  name: 'Özel Medikum Hastanesi',
  slug: 'medikum',
  logo: undefined,
  address: 'Bağcılar Mah. Sağlık Cad. No: 42',
  city: 'İstanbul',
  phone: '+90 212 555 0100',
  email: 'info@medikum.com.tr',
  website: 'www.medikum.com.tr',
  description: 'Özel Medikum Hastanesi, 2008 yılından bu yana İstanbul\'da kaliteli sağlık hizmeti sunmaktadır.',
  vision: 'Hasta odaklı, teknoloji destekli sağlık deneyiminde İstanbul\'un referans hastanesi olmak.',
  mission: 'Her hastaya bireysel ilgi göstererek, en güncel tıbbi yöntemlerle şifaya ulaşmalarını sağlamak.',
  status: 'active',
  createdAt: '2026-01-10T09:00:00Z',
  updatedAt: '2026-04-10T09:00:00Z',
};

// --- Departmanlar ---
export const mockDepartments: Department[] = [
  {
    id: 'dep-1', hospitalId: 'hosp-1', name: 'Kardiyoloji',
    description: 'Kalp ve damar hastalıklarının tanı ve tedavisi.',
    tags: ['kalp', 'damar', 'ritim', 'anjiyografi'],
    doctorCount: 4, color: '#ef4444', icon: '❤️', isActive: true,
  },
  {
    id: 'dep-2', hospitalId: 'hosp-1', name: 'Nöroloji',
    description: 'Beyin ve sinir sistemi hastalıklarının yönetimi.',
    tags: ['baş ağrısı', 'epilepsi', 'inme', 'parkinson'],
    doctorCount: 3, color: '#8b5cf6', icon: '🧠', isActive: true,
  },
  {
    id: 'dep-3', hospitalId: 'hosp-1', name: 'Ortopedi',
    description: 'Kas ve iskelet sistemi hastalıkları.',
    tags: ['diz', 'omurga', 'kırık', 'spor yaralanması'],
    doctorCount: 5, color: '#f59e0b', icon: '🦴', isActive: true,
  },
  {
    id: 'dep-4', hospitalId: 'hosp-1', name: 'Pediatri',
    description: '0–18 yaş arası çocuk sağlığı ve hastalıkları.',
    tags: ['bebek', 'çocuk', 'aşı', 'gelişim'],
    doctorCount: 3, color: '#10b981', icon: '👶', isActive: true,
  },
  {
    id: 'dep-5', hospitalId: 'hosp-1', name: 'Dermatoloji',
    description: 'Cilt, saç ve tırnak hastalıklarının tedavisi.',
    tags: ['akne', 'egzama', 'saç dökülmesi', 'cilt kanseri'],
    doctorCount: 2, color: '#6366f1', icon: '🩺', isActive: true,
  },
  {
    id: 'dep-6', hospitalId: 'hosp-1', name: 'KBB',
    description: 'Kulak, burun ve boğaz hastalıkları.',
    tags: ['işitme', 'sinüzit', 'bademcik', 'vertigo'],
    doctorCount: 3, color: '#f97316', icon: '👂', isActive: true,
  },
];

// --- Odalar ---
export const mockRooms: Room[] = [
  { id: 'room-1', hospitalId: 'hosp-1', departmentId: 'dep-1', number: '101', floor: 1, type: 'polyclinic', status: 'occupied', capacity: 1, assignedDoctorId: 'doc-1' },
  { id: 'room-2', hospitalId: 'hosp-1', departmentId: 'dep-1', number: '102', floor: 1, type: 'polyclinic', status: 'available', capacity: 1 },
  { id: 'room-3', hospitalId: 'hosp-1', departmentId: 'dep-2', number: '201', floor: 2, type: 'polyclinic', status: 'occupied', capacity: 1, assignedDoctorId: 'doc-3' },
  { id: 'room-4', hospitalId: 'hosp-1', departmentId: 'dep-3', number: '301', floor: 3, type: 'examination', status: 'occupied', capacity: 1, assignedDoctorId: 'doc-4' },
  { id: 'room-5', hospitalId: 'hosp-1', departmentId: 'dep-3', number: '302', floor: 3, type: 'polyclinic', status: 'available', capacity: 1 },
  { id: 'room-6', hospitalId: 'hosp-1', departmentId: 'dep-4', number: '401', floor: 4, type: 'polyclinic', status: 'occupied', capacity: 1 },
  { id: 'room-7', hospitalId: 'hosp-1', departmentId: 'dep-1', number: 'OP-1', floor: 0, type: 'operation', status: 'maintenance', capacity: 6 },
];

// --- Doktorlar ---
export const mockDoctors: Doctor[] = [
  {
    id: 'doc-1', hospitalId: 'hosp-1', departmentId: 'dep-1',
    firstName: 'Ahmet', lastName: 'Kaya', email: 'ahmet.kaya@medikum.com.tr',
    phone: '+90 532 111 2233', gender: 'erkek', role: 'doctor', status: 'active',
    title: 'Prof. Dr.', specialty: 'Kardiyoloji', experienceYears: 18,
    bio: 'İnvaziv kardiyoloji ve kateter müdahaleler konusunda uzmanlaşmıştır.',
    previousHospitals: ['Hacettepe Üniversitesi', 'Florence Nightingale'],
    education: ['İstanbul Üniversitesi Tıp Fakültesi', 'Almanya Heidelberg Üniversitesi (Fellowship)'],
    languages: ['Türkçe', 'İngilizce', 'Almanca'],
    roomNumber: '101', floor: 1,
    rating: 4.9, reviewCount: 312, availableForOnline: true, consultationFee: 800,
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'doc-2', hospitalId: 'hosp-1', departmentId: 'dep-1',
    firstName: 'Şerife', lastName: 'Demir', email: 'serife.demir@medikum.com.tr',
    phone: '+90 533 222 3344', gender: 'kadın', role: 'doctor', status: 'active',
    title: 'Uzm. Dr.', specialty: 'Kardiyoloji', experienceYears: 9,
    bio: 'Ekokardiyografi ve kalp yetmezliği konularında uzmanlaşmıştır.',
    previousHospitals: ['Kartal Eğitim Araştırma Hastanesi'],
    education: ['Ege Üniversitesi Tıp Fakültesi'],
    languages: ['Türkçe', 'İngilizce'],
    roomNumber: '102', floor: 1,
    rating: 4.7, reviewCount: 180, availableForOnline: true, consultationFee: 600,
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'doc-3', hospitalId: 'hosp-1', departmentId: 'dep-2',
    firstName: 'Mehmet', lastName: 'Öztürk', email: 'mehmet.ozturk@medikum.com.tr',
    phone: '+90 534 333 4455', gender: 'erkek', role: 'doctor', status: 'active',
    title: 'Doç. Dr.', specialty: 'Nöroloji', experienceYears: 14,
    bio: 'Migren, epilepsi ve hareket bozuklukları alanında deneyimlidir.',
    previousHospitals: ['Gazi Üniversitesi Hastanesi'],
    education: ['Ankara Üniversitesi Tıp Fakültesi'],
    languages: ['Türkçe', 'İngilizce'],
    roomNumber: '201', floor: 2,
    rating: 4.8, reviewCount: 256, availableForOnline: false, consultationFee: 700,
    createdAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'doc-4', hospitalId: 'hosp-1', departmentId: 'dep-3',
    firstName: 'Fatma', lastName: 'Çelik', email: 'fatma.celik@medikum.com.tr',
    phone: '+90 535 444 5566', gender: 'kadın', role: 'doctor', status: 'active',
    title: 'Op. Dr.', specialty: 'Ortopedi ve Travmatoloji', experienceYears: 11,
    bio: 'Diz ve omurga cerrahisi konusunda özelleşmiştir.',
    previousHospitals: ['Acıbadem Hastanesi'],
    education: ['İstanbul Tıp Fakültesi'],
    languages: ['Türkçe', 'İngilizce'],
    roomNumber: '301', floor: 3,
    rating: 4.6, reviewCount: 198, availableForOnline: false, consultationFee: 750,
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'doc-5', hospitalId: 'hosp-1', departmentId: 'dep-4',
    firstName: 'Ali', lastName: 'Yıldız', email: 'ali.yildiz@medikum.com.tr',
    phone: '+90 536 555 6677', gender: 'erkek', role: 'doctor', status: 'active',
    title: 'Uzm. Dr.', specialty: 'Çocuk Sağlığı ve Hastalıkları', experienceYears: 8,
    bio: 'Çocuk enfeksiyon hastalıkları ve alerji-astım uzmanı.',
    previousHospitals: [],
    education: ['Marmara Üniversitesi Tıp Fakültesi'],
    languages: ['Türkçe'],
    roomNumber: '401', floor: 4,
    rating: 4.9, reviewCount: 420, availableForOnline: true, consultationFee: 500,
    createdAt: '2026-03-01T09:00:00Z',
  },
];

// --- Personel ---
export const mockStaff: Staff[] = [
  {
    id: 'staff-1', hospitalId: 'hosp-1', departmentId: 'dep-1',
    firstName: 'Ayşe', lastName: 'Güneş', email: 'ayse.gunes@medikum.com.tr',
    phone: '+90 537 111 0011', gender: 'kadın', role: 'secretary', status: 'active',
    permissions: ['view_appointments', 'manage_appointments', 'view_patients'],
    shift: 'morning', createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'staff-2', hospitalId: 'hosp-1',
    firstName: 'Kemal', lastName: 'Arslan', email: 'kemal.arslan@medikum.com.tr',
    phone: '+90 537 222 0022', gender: 'erkek', role: 'hospital_admin', status: 'active',
    permissions: ['all'],
    createdAt: '2026-01-10T09:00:00Z',
  },
];

// --- Hastalar ---
export const mockPatients: Patient[] = [
  {
    id: 'pat-1', firstName: 'Zeynep', lastName: 'Şahin', email: 'zeynep@example.com',
    phone: '+90 538 111 9901', gender: 'kadın', role: 'patient', status: 'active',
    idNumber: '12345678901', birthDate: '1992-07-15',
    bloodType: 'A+', address: 'Kadıköy, İstanbul',
    emergencyContact: { name: 'Murat Şahin', phone: '+90 538 100 0000', relation: 'Eş' },
    medicalHistory: ['Hipertansiyon', 'Tiroid Nodülü'],
    allergies: ['Penisilin'],
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'pat-2', firstName: 'Mustafa', lastName: 'Koç', email: 'mustafa@example.com',
    phone: '+90 538 222 9902', gender: 'erkek', role: 'patient', status: 'active',
    idNumber: '98765432109', birthDate: '1978-03-22',
    bloodType: '0+', address: 'Üsküdar, İstanbul',
    medicalHistory: ['Diyabet Tip 2'],
    allergies: [],
    familyMembers: [
      { id: 'fam-1', firstName: 'Lale', lastName: 'Koç', relation: 'Eş', gender: 'kadın', birthDate: '1981-09-10' },
      { id: 'fam-2', firstName: 'Emre', lastName: 'Koç', relation: 'Çocuk', gender: 'erkek', birthDate: '2010-06-05' },
    ],
    createdAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'pat-3', firstName: 'Elif', lastName: 'Arslan', email: 'elif@example.com',
    phone: '+90 538 333 9903', gender: 'kadın', role: 'patient', status: 'active',
    birthDate: '2001-11-30', bloodType: 'B-', address: 'Beşiktaş, İstanbul',
    medicalHistory: [],
    allergies: ['Aspirin'],
    createdAt: '2026-03-10T09:00:00Z',
  },
];

// --- Randevular ---
export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1', hospitalId: 'hosp-1', doctorId: 'doc-1', patientId: 'pat-1',
    departmentId: 'dep-1', date: '2026-04-16', startTime: '09:00', endTime: '09:30',
    type: 'face_to_face', status: 'confirmed',
    complaint: 'Göğüs ağrısı ve nefes darlığı',
    documents: ['kan_tahlili_nisan.pdf', 'ekg_sonucu.png'],
    aiReport: 'Yapay zeka ön analizi: Hastanın girdiği şikayetler (Göğüs ağrısı, Nefes darlığı) kalp veya akciğer kaynaklı akut bir duruma işaret edebilir. Yüklenen EKG görseli temel parametrelerde sapma sinyali veriyor. Kardiyoloji uzmanı tarafından öncelikli değerlendirilmesi önerilir.',
    createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'apt-2', hospitalId: 'hosp-1', doctorId: 'doc-1', patientId: 'pat-2',
    departmentId: 'dep-1', date: '2026-04-16', startTime: '09:30', endTime: '10:00',
    type: 'online', status: 'confirmed',
    complaint: 'Rutin kontrol — son çekilen EKG değerlendirmesi',
    zoomLink: 'https://zoom.us/j/1234567890',
    createdAt: '2026-04-11T11:00:00Z', updatedAt: '2026-04-11T11:00:00Z',
  },
  {
    id: 'apt-3', hospitalId: 'hosp-1', doctorId: 'doc-1', patientId: 'pat-3',
    departmentId: 'dep-1', date: '2026-04-16', startTime: '10:00', endTime: '10:30',
    type: 'face_to_face', status: 'pending',
    complaint: 'Çarpıntı şikayeti, baş dönmesi',
    createdAt: '2026-04-12T09:30:00Z', updatedAt: '2026-04-12T09:30:00Z',
  },
  {
    id: 'apt-4', hospitalId: 'hosp-1', doctorId: 'doc-1', patientId: 'pat-1',
    departmentId: 'dep-1', date: '2026-04-16', startTime: '11:00', endTime: '11:30',
    type: 'face_to_face', status: 'confirmed',
    complaint: 'Tansiyon takibi',
    createdAt: '2026-04-13T08:00:00Z', updatedAt: '2026-04-13T08:00:00Z',
  },
  {
    id: 'apt-5', hospitalId: 'hosp-1', doctorId: 'doc-1', patientId: 'pat-2',
    departmentId: 'dep-1', date: '2026-04-16', startTime: '14:00', endTime: '14:30',
    type: 'face_to_face', status: 'confirmed',
    createdAt: '2026-04-14T10:00:00Z', updatedAt: '2026-04-14T10:00:00Z',
  },
  // Geçmiş randevular
  {
    id: 'apt-6', hospitalId: 'hosp-1', doctorId: 'doc-1', patientId: 'pat-1',
    departmentId: 'dep-1', date: '2026-04-10', startTime: '09:00', endTime: '09:30',
    type: 'face_to_face', status: 'completed',
    complaint: 'İlk muayene',
    note: 'Efor testi yapıldı, sonuçlar normal sınırlarda. Bir ay sonra kontrol.',
    createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-04-10T09:35:00Z',
  },
  {
    id: 'apt-7', hospitalId: 'hosp-1', doctorId: 'doc-5', patientId: 'pat-2',
    departmentId: 'dep-4', date: '2026-04-18', startTime: '10:00', endTime: '10:30',
    type: 'face_to_face', status: 'confirmed',
    complaint: 'Ateş ve öksürük',
    createdAt: '2026-04-15T08:00:00Z', updatedAt: '2026-04-15T08:00:00Z',
  },
];

// --- Dashboard İstatistikleri ---
export const mockDashboardStats = {
  today: {
    totalAppointments: 47,
    occupancyRate: 82,
    newPatients: 8,
    onlineConsultations: 12,
    cancelledAppointments: 3,
    revenue: 28400,
  },
  weeklyAppointments: [
    { day: 'Pzt', count: 42 },
    { day: 'Sal', count: 38 },
    { day: 'Çar', count: 51 },
    { day: 'Per', count: 47 },
    { day: 'Cum', count: 55 },
    { day: 'Cmt', count: 29 },
    { day: 'Paz', count: 18 },
  ],
  topDepartments: [
    { name: 'Kardiyoloji', count: 89, percentage: 32 },
    { name: 'Ortopedi',    count: 67, percentage: 24 },
    { name: 'Pediatri',    count: 54, percentage: 19 },
    { name: 'Nöroloji',    count: 42, percentage: 15 },
    { name: 'Diğer',       count: 28, percentage: 10 },
  ],
  socialMediaLeads: {
    instagram: 23,
    total: 38,
    conversionRate: 71,
  },
  recentActivity: [
    { id: '1', type: 'new_patient', message: 'Zeynep Şahin yeni hasta kaydı oluşturdu', time: '09:42' },
    { id: '2', type: 'appointment', message: 'Mustafa Koç randevusunu iptal etti', time: '10:05' },
    { id: '3', type: 'staff',       message: 'Dr. Fatma Çelik vardiya değiştirdi', time: '10:30' },
    { id: '4', type: 'new_patient', message: 'Instagram\'dan 3 yeni potansiyel hasta', time: '11:00' },
    { id: '5', type: 'appointment', message: 'Elif Arslan randevu aldı (Kardiyoloji)', time: '11:22' },
  ],
};
