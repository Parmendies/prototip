import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  time,
  jsonb,
  smallint,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ----------------------------------------------------------------------
// 1. staff_users (Klinik Personeli: Admin, Sekreter, Hekim)
// ----------------------------------------------------------------------
export const staffUsers = pgTable('staff_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'secretary', 'doctor'] }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 2. doctor_profiles (Hekim Ayarları, Branş, Taban Muayene Ücreti)
// ----------------------------------------------------------------------
export const doctorProfiles = pgTable('doctor_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  staffUserId: uuid('staff_user_id')
    .notNull()
    .unique()
    .references(() => staffUsers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // Dt., Uzm. Dt., Prof. Dr.
  branch: text('branch').notNull(), // Genel Diş, Ortodonti, Çene Cerrahisi, Endodonti
  initialExamFee: numeric('initial_exam_fee', { precision: 10, scale: 2 }).notNull().default('800.00'),
  defaultSlotMinutes: integer('default_slot_minutes').notNull().default(30),
  workingSchedule: jsonb('working_schedule').$type<{
    days: number[]; // 1=Pzt .. 6=Cmt
    startHour: string; // "09:00"
    endHour: string; // "18:00"
    breakStart?: string; // "13:00"
    breakEnd?: string; // "14:00"
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 3. patients (Hastalar - Telefon + 4 Haneli PIN)
// ----------------------------------------------------------------------
export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull().unique(), // +905XXXXXXXXX
  pinHash: text('pin_hash'), // bcrypt hash of 4-digit PIN (null ise ilk girişte belirlenir)
  failedPinAttempts: integer('failed_pin_attempts').notNull().default(0),
  pinLockedUntil: timestamp('pin_locked_until', { withTimezone: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  tcIdentityNo: varchar('tc_identity_no', { length: 11 }),
  birthDate: date('birth_date'),
  medicalAlertNote: text('medical_alert_note'), // Alerji, kronik rahatsızlık vb.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 4. procedure_templates (Hazır Diş İşlem & Fiyat Kataloğu)
// ----------------------------------------------------------------------
export const procedureTemplates = pgTable('procedure_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(), // "Kompozit Dolgu", "Kanal Tedavisi Tek Kök"
  category: text('category').notNull().default('Genel'), // Tedavi, Cerrahi, Estetik, Protez
  defaultPrice: numeric('default_price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  defaultDurationMin: integer('default_duration_min').notNull().default(30),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 5. treatment_plans (Tedavi Planı Başlığı)
// ----------------------------------------------------------------------
export const treatmentPlans = pgTable('treatment_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctorProfiles.id, { onDelete: 'cascade' }),
  sourceAppointmentId: uuid('source_appointment_id'),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] })
    .default('active')
    .notNull(),
  doctorSummaryNote: text('doctor_summary_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 6. treatment_steps (Tedavi Seans Adımları & Fiyatları)
// ----------------------------------------------------------------------
export const treatmentSteps = pgTable('treatment_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => treatmentPlans.id, { onDelete: 'cascade' }),
  stepOrder: integer('step_order').notNull().default(1),
  fdiNumber: smallint('fdi_number'), // 11..48 (ilgili diş)
  procedureTemplateId: uuid('procedure_template_id').references(() => procedureTemplates.id),
  title: text('title').notNull(), // "1. Seans: Kanal Tedavisi Kök Temizliği"
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationMin: integer('duration_min').notNull().default(30),
  executionMode: text('execution_mode', { enum: ['scheduled_session', 'same_day_chairside'] })
    .default('scheduled_session')
    .notNull(),
  status: text('status', {
    enum: ['planned', 'scheduled', 'awaiting_payment', 'paid', 'completed'],
  })
    .default('planned')
    .notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 7. appointments (Randevular & Canlı Akış Durumu)
// ----------------------------------------------------------------------
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctorProfiles.id, { onDelete: 'cascade' }),
  treatmentStepId: uuid('treatment_step_id').references(() => treatmentSteps.id),
  appointmentDate: date('appointment_date').notNull(), // YYYY-MM-DD
  startTime: time('start_time').notNull(), // HH:MM:SS
  endTime: time('end_time').notNull(), // HH:MM:SS
  durationMin: integer('duration_min').notNull().default(30),
  visitType: text('visit_type', { enum: ['initial_exam', 'treatment_session'] })
    .notNull()
    .default('initial_exam'),
  status: text('status', {
    enum: [
      'pending_approval', // Ön Talep
      'confirmed', // Onaylandı
      'checked_in_unpaid', // QR Okuttu - Ödeme Bekliyor
      'waiting_room', // Ödendi - Bekleme Odasında
      'in_chair', // Koltukta / Muayenede
      'awaiting_chairside_payment', // Koltukta Ek İşlem Kilidi
      'completed', // Tamamlandı
      'cancelled', // İptal
      'no_show', // Gelmedi
    ],
  })
    .default('pending_approval')
    .notNull(),
  isEarlyArrival: boolean('is_early_arrival').default(false).notNull(),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  checkInMethod: text('check_in_method', { enum: ['qr', 'manual'] }),
  complaintText: text('complaint_text'),
  createdBy: text('created_by', { enum: ['patient', 'secretary'] })
    .default('patient')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 8. payments (Kasa Tahsilat Hareketleri)
// ----------------------------------------------------------------------
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointments.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  treatmentStepId: uuid('treatment_step_id').references(() => treatmentSteps.id),
  paymentKind: text('payment_kind', {
    enum: ['initial_exam', 'session_prepay', 'same_day_chairside'],
  }).notNull(),
  expectedAmount: numeric('expected_amount', { precision: 10, scale: 2 }).notNull(),
  collectedAmount: numeric('collected_amount', { precision: 10, scale: 2 }).notNull(),
  method: text('method', { enum: ['pos', 'cash'] }).notNull(),
  status: text('status', { enum: ['pending', 'collected', 'cancelled'] })
    .default('collected')
    .notNull(),
  approvedByStaffId: uuid('approved_by_staff_id')
    .notNull()
    .references(() => staffUsers.id),
  collectedAt: timestamp('collected_at', { withTimezone: true }).defaultNow().notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 9. tooth_records (FDI 11–48 Metin Tabanlı Diş Durum Kayıtları)
// ----------------------------------------------------------------------
export const toothRecords = pgTable('tooth_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctorProfiles.id),
  fdiNumber: smallint('fdi_number').notNull(), // 11..18, 21..28, 31..38, 41..48
  condition: text('condition', {
    enum: [
      'caries', // Çürük
      'filling', // Dolgu
      'root_canal', // Kanal Tedavili
      'implant', // İmplant
      'crown', // Kaplama/Kron
      'missing', // Eksik Diş
      'extraction_needed', // Çekim Gerekiyor
      'healthy', // Sağlam
    ],
  }).notNull(),
  clinicalNote: text('clinical_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 10. prescriptions (E-Reçete Yansıması)
// ----------------------------------------------------------------------
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointments.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctorProfiles.id),
  medulaErefNo: text('medula_eref_no').notNull(), // örn: REC-2026-9841
  medications: jsonb('medications')
    .notNull()
    .$type<Array<{ name: string; dosage: string; frequency: string; notes?: string }>>(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// 11. patient_notifications (Uygulama İçi Canlı Bildirimler)
// ----------------------------------------------------------------------
export const patientNotifications = pgTable('patient_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: [
      'appointment_confirmed',
      'appointment_updated',
      'plan_created',
      'prescription_ready',
      'session_scheduled',
    ],
  }).notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------------------------
// RELATIONS
// ----------------------------------------------------------------------
export const staffUsersRelations = relations(staffUsers, ({ one }) => ({
  doctorProfile: one(doctorProfiles, {
    fields: [staffUsers.id],
    references: [doctorProfiles.staffUserId],
  }),
}));

export const doctorProfilesRelations = relations(doctorProfiles, ({ one, many }) => ({
  staffUser: one(staffUsers, {
    fields: [doctorProfiles.staffUserId],
    references: [staffUsers.id],
  }),
  appointments: many(appointments),
  treatmentPlans: many(treatmentPlans),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  treatmentPlans: many(treatmentPlans),
  toothRecords: many(toothRecords),
  notifications: many(patientNotifications),
}));

export const treatmentPlansRelations = relations(treatmentPlans, ({ one, many }) => ({
  patient: one(patients, {
    fields: [treatmentPlans.patientId],
    references: [patients.id],
  }),
  doctor: one(doctorProfiles, {
    fields: [treatmentPlans.doctorId],
    references: [doctorProfiles.id],
  }),
  steps: many(treatmentSteps),
}));

export const treatmentStepsRelations = relations(treatmentSteps, ({ one }) => ({
  plan: one(treatmentPlans, {
    fields: [treatmentSteps.planId],
    references: [treatmentPlans.id],
  }),
  procedureTemplate: one(procedureTemplates, {
    fields: [treatmentSteps.procedureTemplateId],
    references: [procedureTemplates.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctorProfiles, {
    fields: [appointments.doctorId],
    references: [doctorProfiles.id],
  }),
  treatmentStep: one(treatmentSteps, {
    fields: [appointments.treatmentStepId],
    references: [treatmentSteps.id],
  }),
  payments: many(payments),
  prescription: one(prescriptions, {
    fields: [appointments.id],
    references: [prescriptions.appointmentId],
  }),
}));

