import { db } from '@/db';
import { patientNotifications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_updated'
  | 'plan_created'
  | 'prescription_ready'
  | 'session_scheduled';

export async function sendPatientNotification({
  patientId,
  type,
  title,
  body,
}: {
  patientId: string;
  type: NotificationType;
  title: string;
  body: string;
}) {
  try {
    const [inserted] = await db
      .insert(patientNotifications)
      .values({
        patientId,
        type,
        title,
        body,
        isRead: false,
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error('Failed to create patient notification:', error);
    return null;
  }
}

export async function getPatientNotifications(patientId: string) {
  try {
    return await db
      .select()
      .from(patientNotifications)
      .where(eq(patientNotifications.patientId, patientId))
      .orderBy(desc(patientNotifications.createdAt))
      .limit(20);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
}

