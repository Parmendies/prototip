// =====================================================
// TİP TANIMLARI — Kullanıcılar
// =====================================================

export type UserRole = 'super_admin' | 'hospital_admin' | 'doctor' | 'secretary' | 'patient';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type Gender = 'erkek' | 'kadın' | 'belirtilmemiş';

export interface BaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  gender: Gender;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Doctor extends BaseUser {
  role: 'doctor';
  hospitalId: string;
  departmentId: string;
  title: string; // "Prof. Dr.", "Op. Dr.", "Uzm. Dr."
  specialty: string;
  bio?: string;
  experienceYears: number;
  previousHospitals?: string[];
  education?: string[];
  languages?: string[];
  roomNumber?: string;
  floor?: number;
  rating: number;
  reviewCount: number;
  availableForOnline: boolean;
  consultationFee?: number;
}

export interface Staff extends BaseUser {
  role: 'secretary' | 'hospital_admin';
  hospitalId: string;
  departmentId?: string;
  permissions: string[];
  shift?: 'morning' | 'afternoon' | 'full';
}

export interface Patient extends BaseUser {
  role: 'patient';
  idNumber?: string; // TC veya Pasaport No
  birthDate?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  familyMembers?: FamilyMember[];
  medicalHistory?: string[];
  allergies?: string[];
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relation: string;  // "Eş", "Çocuk", "Anne", "Baba"
  birthDate?: string;
  idNumber?: string;
  gender: Gender;
}
