import { clinicToday } from '@/lib/time';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import DoctorCalendarClient from './DoctorCalendarClient';

export const dynamic = 'force-dynamic';

export default async function DoctorCalendarPage() {
  const session = await requireDoctor();

  const rows = await db
    .select({
      appointment: schema.appointments,
      patient: schema.patients,
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .where(eq(schema.appointments.doctorId, session.doctorId))
    .orderBy(desc(schema.appointments.appointmentDate), desc(schema.appointments.startTime));

  const appointments = rows.map((r) => ({
    ...r.appointment,
    patient: {
      id: r.patient.id,
      firstName: r.patient.firstName,
      lastName: r.patient.lastName,
      phone: r.patient.phone,
    },
  }));

  const todayStr = clinicToday();

  return <DoctorCalendarClient appointments={appointments} todayStr={todayStr} />;
}
