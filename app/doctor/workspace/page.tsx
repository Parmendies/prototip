import { clinicToday } from '@/lib/time';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import { requireDoctor } from '@/lib/auth/dal';
import DoctorWorkspaceClient from './DoctorWorkspaceClient';

export const dynamic = 'force-dynamic';

export default async function DoctorWorkspacePage() {
  const session = await requireDoctor();

  // 1. Fetch Doctor Profile
  const [docProfile] = await db
    .select({
      id: schema.doctorProfiles.id,
      title: schema.doctorProfiles.title,
      branch: schema.doctorProfiles.branch,
      initialExamFee: schema.doctorProfiles.initialExamFee,
      fullName: schema.staffUsers.fullName,
    })
    .from(schema.doctorProfiles)
    .innerJoin(schema.staffUsers, eq(schema.doctorProfiles.staffUserId, schema.staffUsers.id))
    .where(eq(schema.doctorProfiles.id, session.doctorId))
    .limit(1);

  const doctorData = {
    id: session.doctorId,
    title: docProfile?.title || 'Dt.',
    specialty: docProfile?.branch || 'Diş Hekimi',
    roomNumber: '1',
    examinationFee: docProfile?.initialExamFee || '800.00',
    doctorName: docProfile?.fullName || session.fullName,
  };

  const todayStr = clinicToday();

  // 2. Fetch Active in-chair appointment
  const inChairRows = await db
    .select({
      appointment: schema.appointments,
      patient: schema.patients,
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .where(
      and(
        eq(schema.appointments.doctorId, session.doctorId),
        inArray(schema.appointments.status, ['in_chair', 'awaiting_chairside_payment'])
      )
    )
    .orderBy(desc(schema.appointments.updatedAt))
    .limit(1);

  const inChairAppointment = inChairRows.length > 0
    ? {
        ...inChairRows[0].appointment,
        patient: inChairRows[0].patient,
      }
    : null;

  // 3. Fetch Waiting Room appointments (checked-in + paid)
  const waitingRoomRows = await db
    .select({
      appointment: schema.appointments,
      patient: schema.patients,
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .where(
      and(
        eq(schema.appointments.doctorId, session.doctorId),
        eq(schema.appointments.appointmentDate, todayStr),
        eq(schema.appointments.status, 'waiting_room')
      )
    )
    .orderBy(asc(schema.appointments.checkedInAt), asc(schema.appointments.startTime));

  const waitingRoomAppointments = waitingRoomRows.map((r) => ({
    ...r.appointment,
    patient: r.patient,
  }));

  // 4. Fetch Completed appointments today
  const completedRows = await db
    .select({
      appointment: schema.appointments,
      patient: schema.patients,
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .where(
      and(
        eq(schema.appointments.doctorId, session.doctorId),
        eq(schema.appointments.appointmentDate, todayStr),
        eq(schema.appointments.status, 'completed')
      )
    )
    .orderBy(desc(schema.appointments.updatedAt));

  const completedAppointments = completedRows.map((r) => ({
    ...r.appointment,
    patient: r.patient,
  }));

  // 5. Fetch Upcoming today appointments (not yet arrived or checking in)
  const upcomingRows = await db
    .select({
      appointment: schema.appointments,
      patient: schema.patients,
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .where(
      and(
        eq(schema.appointments.doctorId, session.doctorId),
        eq(schema.appointments.appointmentDate, todayStr),
        inArray(schema.appointments.status, ['confirmed', 'checked_in_unpaid'])
      )
    )
    .orderBy(asc(schema.appointments.startTime));

  const upcomingAppointments = upcomingRows.map((r) => ({
    ...r.appointment,
    patient: r.patient,
  }));

  return (
    <DoctorWorkspaceClient
      doctor={doctorData}
      inChairAppointment={inChairAppointment}
      waitingRoomAppointments={waitingRoomAppointments}
      completedAppointments={completedAppointments}
      upcomingAppointments={upcomingAppointments}
    />
  );
}
