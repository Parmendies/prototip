'use server';

import { db } from '@/db';
import {
  appointments,
  patients,
  doctorProfiles,
  staffUsers,
  payments,
  treatmentPlans,
  treatmentSteps,
} from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { requireSecretaryOrAdmin } from '@/lib/auth/dal';
import { sendPatientNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';
import { getExpectedCharge, type PaymentKind } from '@/lib/billing';
import { clinicToday, CLINIC_TZ } from '@/lib/time';
import { computeEndTime, getDoctorDaySlots, getDoctorScheduleInfo, validateBookableSlot } from '@/lib/schedule';
import { broadcastChange } from '@/lib/realtime';
import { minutesUntilAppointment } from '@/lib/time';

export async function getSecretaryDeskData() {
  const staff = await requireSecretaryOrAdmin();
  const todayStr = clinicToday();

  // 1. Today's Appointments with Patient and Doctor Details
  const todayList = await db
    .select({
      id: appointments.id,
      date: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      durationMin: appointments.durationMin,
      status: appointments.status,
      visitType: appointments.visitType,
      isEarlyArrival: appointments.isEarlyArrival,
      checkInMethod: appointments.checkInMethod,
      checkedInAt: appointments.checkedInAt,
      complaintText: appointments.complaintText,
      treatmentStepId: appointments.treatmentStepId,
      // Patient info
      patientId: patients.id,
      patientName: sql<string>`concat(${patients.firstName}, ' ', ${patients.lastName})`,
      patientPhone: patients.phone,
      patientHasPin: sql<boolean>`${patients.pinHash} IS NOT NULL`,
      // Doctor info
      doctorId: doctorProfiles.id,
      doctorName: staffUsers.fullName,
      doctorTitle: doctorProfiles.title,
      doctorBranch: doctorProfiles.branch,
      initialExamFee: doctorProfiles.initialExamFee,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(appointments.appointmentDate, todayStr))
    .orderBy(appointments.startTime);

  // Beklenen tahsilat tutarı sunucuda tek kaynaktan hesaplanır (lib/billing.ts)
  const appointmentsWithFees = await Promise.all(
    todayList.map(async (apt) => {
      const charge =
        apt.status === 'checked_in_unpaid' || apt.status === 'awaiting_chairside_payment'
          ? await getExpectedCharge(apt)
          : null;

      return {
        ...apt,
        expectedFee: charge ? String(charge.amount) : apt.initialExamFee,
        feeTitle: charge?.title ?? (apt.treatmentStepId ? 'Tedavi Seansı' : 'Ön Muayene'),
      };
    })
  );

  // 2. Pending Requests (All pending approval)
  const pendingRequests = await db
    .select({
      id: appointments.id,
      date: appointments.appointmentDate,
      startTime: appointments.startTime,
      complaintText: appointments.complaintText,
      visitType: appointments.visitType,
      durationMin: appointments.durationMin,
      treatmentStepId: appointments.treatmentStepId,
      doctorId: appointments.doctorId,
      patientName: sql<string>`concat(${patients.firstName}, ' ', ${patients.lastName})`,
      patientPhone: patients.phone,
      doctorName: staffUsers.fullName,
      doctorTitle: doctorProfiles.title,
      doctorBranch: doctorProfiles.branch,
      initialExamFee: doctorProfiles.initialExamFee,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(doctorProfiles, eq(appointments.doctorId, doctorProfiles.id))
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(appointments.status, 'pending_approval'))
    .orderBy(desc(appointments.createdAt));

  // 3. Today's Collected Payments Summary
  const todayPayments = await db
    .select({
      id: payments.id,
      amount: payments.collectedAmount,
      method: payments.method,
      paymentKind: payments.paymentKind,
      collectedAt: payments.collectedAt,
    })
    .from(payments)
    .where(
      and(
        sql`DATE(${payments.collectedAt} AT TIME ZONE ${CLINIC_TZ}) = ${todayStr}`,
        eq(payments.status, 'collected')
      )
    );

  let totalPos = 0;
  let totalCash = 0;
  todayPayments.forEach((p) => {
    const amt = Number(p.amount);
    if (p.method === 'pos') totalPos += amt;
    else totalCash += amt;
  });

  return {
    staffUser: {
      name: staff.fullName,
      role: staff.role,
    },
    todayAppointments: appointmentsWithFees,
    pendingRequests,
    kasaSummary: {
      totalPos,
      totalCash,
      totalCount: todayPayments.length,
      totalRevenue: totalPos + totalCash,
    },
  };
}

export async function collectPaymentAction({
  appointmentId,
  method,
  note,
}: {
  appointmentId: string;
  method: 'pos' | 'cash';
  note?: string;
  /** @deprecated Tutar ve tür artık sunucuda hesaplanır; istemciden gelen değer yok sayılır. */
  amount?: number;
  /** @deprecated */
  paymentKind?: PaymentKind;
}) {
  const staff = await requireSecretaryOrAdmin();

  if (method !== 'pos' && method !== 'cash') {
    return { success: false, error: 'Geçersiz ödeme yöntemi.' };
  }

  const [apt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId));

  if (!apt) {
    return { success: false, error: 'Randevu bulunamadı.' };
  }

  // Ödeme kapısı: yalnızca "ödeme bekliyor" ve "koltukta ek işlem kilidi" durumlarında tahsilat alınır
  if (apt.status !== 'checked_in_unpaid' && apt.status !== 'awaiting_chairside_payment') {
    return { success: false, error: 'Bu randevu için bekleyen bir tahsilat yok (zaten tahsil edilmiş olabilir).' };
  }

  const charge = await getExpectedCharge(apt);
  if (!charge) {
    return { success: false, error: 'Tahsil edilecek tutar hesaplanamadı.' };
  }

  // checked_in_unpaid → waiting_room (hekim bekleme odası)
  // awaiting_chairside_payment → completed (hekim muayeneyi bitirmiş, çıkış tahsilatı)
  const fromStatus = apt.status;
  const nextStatus = fromStatus === 'awaiting_chairside_payment' ? 'completed' : 'waiting_room';

  try {
    await db.transaction(async (tx) => {
      // Koşullu durum geçişi = idempotency kilidi. Çift tıklamada ikinci istek 0 satır günceller ve geri alınır.
      const moved = await tx
        .update(appointments)
        .set({ status: nextStatus, updatedAt: new Date() })
        .where(and(eq(appointments.id, appointmentId), eq(appointments.status, fromStatus)))
        .returning({ id: appointments.id });

      if (moved.length === 0) {
        throw new Error('ALREADY_COLLECTED');
      }

      await tx.insert(payments).values({
        appointmentId,
        patientId: apt.patientId,
        treatmentStepId: charge.stepIds.length === 1 ? charge.stepIds[0] : apt.treatmentStepId,
        paymentKind: charge.kind,
        expectedAmount: charge.amount.toFixed(2),
        collectedAmount: charge.amount.toFixed(2),
        method,
        status: 'collected',
        approvedByStaffId: staff.staffId,
        collectedAt: new Date(),
        note:
          note ||
          `${method === 'pos' ? 'POS Slip Onaylandı' : 'Nakit Tahsil Edildi'} • ${charge.title}`,
      });

      if (charge.stepIds.length > 0) {
        // Koltukta yapılan işlem tamamlanmış sayılır; seans ücreti ise "ödendi" (işlem seans sonunda tamamlanır)
        await tx
          .update(treatmentSteps)
          .set(
            charge.kind === 'same_day_chairside'
              ? { status: 'completed', completedAt: new Date() }
              : { status: 'paid' }
          )
          .where(inArray(treatmentSteps.id, charge.stepIds));
      }
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'ALREADY_COLLECTED') {
      return { success: false, error: 'Bu tahsilat zaten kaydedildi.' };
    }
    throw err;
  }

  const amountText = charge.amount.toLocaleString('tr-TR');
  const methodText = method === 'pos' ? 'POS' : 'Nakit';

  await sendPatientNotification({
    patientId: apt.patientId,
    type: 'appointment_updated',
    title: 'Ödemeniz Onaylandı',
    body:
      nextStatus === 'completed'
        ? `${amountText} ₺ tutarındaki ödemeniz (${methodText}) alındı. Geçmiş olsun, bugünkü randevunuz tamamlandı.`
        : `${amountText} ₺ tutarındaki ödemeniz (${methodText}) alındı. Lütfen bekleme salonuna geçiniz; hekiminiz sizi çağıracaktır.`,
  });

  await broadcastChange({ doctorId: apt.doctorId, patientId: apt.patientId });
  revalidatePath('/secretary/desk');
  revalidatePath('/doctor/workspace');
  revalidatePath('/patient');
  return { success: true, amount: charge.amount };
}

export async function manualCheckinAction(appointmentId: string) {
  await requireSecretaryOrAdmin();

  const [apt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId));

  if (!apt) return { success: false, error: 'Randevu bulunamadı.' };

  if (apt.appointmentDate !== clinicToday()) {
    return { success: false, error: 'Yalnızca bugünkü randevular için "Geldi" işaretlenebilir.' };
  }

  const updated = await db
    .update(appointments)
    .set({
      status: 'checked_in_unpaid',
      checkedInAt: new Date(),
      checkInMethod: 'manual',
      updatedAt: new Date(),
    })
    .where(and(eq(appointments.id, appointmentId), eq(appointments.status, 'confirmed')))
    .returning({ id: appointments.id });

  if (updated.length === 0) {
    return { success: false, error: 'Randevu onaylı durumda değil; "Geldi" işaretlenemez.' };
  }

  await broadcastChange({ doctorId: apt.doctorId, patientId: apt.patientId });
  revalidatePath('/secretary/desk');
  return { success: true };
}

export async function resetPatientPinAction(patientId: string) {
  await requireSecretaryOrAdmin();

  const [p] = await db.select({ id: patients.id }).from(patients).where(eq(patients.id, patientId));
  if (!p) return { success: false, error: 'Hasta bulunamadı.' };

  await db
    .update(patients)
    .set({
      pinHash: null,
      failedPinAttempts: 0,
      pinLockedUntil: null,
    })
    .where(eq(patients.id, patientId));

  revalidatePath('/secretary/desk');
  return { success: true };
}

/**
 * Ön talebi onaylar. `revision` verilirse (telefonda hastayla anlaşılan) yeni hekim/tarih/saat ile onaylanır.
 */
export async function approvePreRequestAction(
  appointmentId: string,
  revision?: { doctorId: string; date: string; startTime: string }
) {
  await requireSecretaryOrAdmin();

  const [apt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId));

  if (!apt) return { success: false, error: 'Randevu bulunamadı.' };
  if (apt.status !== 'pending_approval') return { success: false, error: 'Bu talep zaten işlenmiş.' };

  let changes: Partial<typeof appointments.$inferInsert> = {};
  const isRevised =
    !!revision &&
    (revision.doctorId !== apt.doctorId ||
      revision.date !== apt.appointmentDate ||
      revision.startTime.slice(0, 5) !== apt.startTime.slice(0, 5));

  if (revision && isRevised) {
    // Seans talebinde hekim değişmez (tedavi planı o hekime ait)
    if (apt.treatmentStepId && revision.doctorId !== apt.doctorId) {
      return { success: false, error: 'Tedavi seansı talebinde hekim değiştirilemez; yalnızca tarih/saat değişebilir.' };
    }
    const doc = await getDoctorScheduleInfo(revision.doctorId);
    if (!doc || !doc.isActive) return { success: false, error: 'Seçilen hekim aktif değil.' };

    const durationMin = apt.treatmentStepId ? apt.durationMin : doc.defaultSlotMinutes || 30;
    const slotError = await validateBookableSlot({
      doctorId: revision.doctorId,
      date: revision.date,
      startTime: revision.startTime,
      durationMin,
      maxDaysAhead: 180,
      excludeAppointmentId: apt.id,
    });
    if (slotError) return { success: false, error: slotError };

    changes = {
      doctorId: revision.doctorId,
      appointmentDate: revision.date,
      startTime: `${revision.startTime.slice(0, 5)}:00`,
      endTime: computeEndTime(revision.startTime, durationMin),
      durationMin,
    };
  }

  const updated = await db
    .update(appointments)
    .set({ ...changes, status: 'confirmed', updatedAt: new Date() })
    .where(and(eq(appointments.id, appointmentId), eq(appointments.status, 'pending_approval')))
    .returning();

  if (updated.length === 0) {
    return { success: false, error: 'Bu talep zaten işlenmiş.' };
  }
  const final = updated[0];

  await sendPatientNotification({
    patientId: apt.patientId,
    type: 'appointment_confirmed',
    title: isRevised ? 'Randevunuz Güncellenerek Onaylandı' : 'Randevunuz Onaylandı',
    body: isRevised
      ? `Talebiniz telefonda görüşüldüğü şekilde ${final.appointmentDate} saat ${final.startTime.slice(0, 5)} olarak güncellenip onaylandı. Randevu günü danışmadaki QR kodu telefonunuzla okutunuz.`
      : `${final.appointmentDate} saat ${final.startTime.slice(0, 5)} randevunuz onaylanmıştır. Randevu günü danışmadaki QR kodu telefonunuzla okutunuz.`,
  });

  await broadcastChange({ doctorId: final.doctorId, patientId: apt.patientId });
  if (final.doctorId !== apt.doctorId) await broadcastChange({ doctorId: apt.doctorId });
  revalidatePath('/secretary/desk');
  revalidatePath('/secretary/requests');
  return { success: true };
}

/** Banko talep revizyonu için: talebin kendi eski saati boş sayılır. */
export async function getSlotsForRequestAction(appointmentId: string, doctorId: string, date: string) {
  await requireSecretaryOrAdmin();
  const [apt] = await db.select().from(appointments).where(eq(appointments.id, appointmentId));
  if (!apt) return { slots: [], isWorkingDay: false };
  const doc = await getDoctorScheduleInfo(doctorId);
  const durationMin = apt.treatmentStepId ? apt.durationMin : doc?.defaultSlotMinutes || 30;
  return getDoctorDaySlots(doctorId, date, durationMin, { excludeAppointmentId: apt.id });
}

/** Randevu saati geçmiş ve gelmemiş hastayı "Gelmedi" işaretler; takvimdeki yeri boşalır. */
export async function markNoShowAction(appointmentId: string) {
  await requireSecretaryOrAdmin();

  const [apt] = await db.select().from(appointments).where(eq(appointments.id, appointmentId));
  if (!apt) return { success: false, error: 'Randevu bulunamadı.' };

  if (minutesUntilAppointment(apt.appointmentDate, apt.startTime) > 0) {
    return { success: false, error: 'Randevu saati henüz gelmedi; "Gelmedi" işaretlenemez.' };
  }

  const updated = await db
    .update(appointments)
    .set({ status: 'no_show', updatedAt: new Date() })
    .where(and(eq(appointments.id, appointmentId), eq(appointments.status, 'confirmed')))
    .returning({ id: appointments.id });
  if (updated.length === 0) return { success: false, error: 'Yalnızca onaylı (gelmemiş) randevu "Gelmedi" işaretlenebilir.' };

  if (apt.treatmentStepId) {
    await db
      .update(treatmentSteps)
      .set({ status: 'planned' })
      .where(and(eq(treatmentSteps.id, apt.treatmentStepId), eq(treatmentSteps.status, 'scheduled')));
  }

  await sendPatientNotification({
    patientId: apt.patientId,
    type: 'appointment_updated',
    title: 'Randevunuza Gelmediniz',
    body: `${apt.appointmentDate} saat ${apt.startTime.slice(0, 5)} randevunuza gelmediğiniz kaydedildi. Yeni randevu için uygulamadan talep oluşturabilir veya bankoyu arayabilirsiniz.`,
  });

  await broadcastChange({ doctorId: apt.doctorId, patientId: apt.patientId });
  revalidatePath('/secretary/desk');
  return { success: true };
}

export async function cancelAppointmentAction(appointmentId: string, reason?: string) {
  await requireSecretaryOrAdmin();

  const [apt] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId));

  if (!apt) return { success: false, error: 'Randevu bulunamadı.' };

  // Ödemesi alınmış / muayenesi başlamış randevu iptal edilemez (kasa tutarlılığı)
  const updated = await db
    .update(appointments)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(appointments.id, appointmentId),
        inArray(appointments.status, ['pending_approval', 'confirmed', 'checked_in_unpaid'])
      )
    )
    .returning({ id: appointments.id });

  if (updated.length === 0) {
    return { success: false, error: 'Bu aşamadaki randevu iptal edilemez.' };
  }

  // Seans randevusu iptal edilirse adım tekrar planlanabilir hale gelir
  if (apt.treatmentStepId) {
    await db
      .update(treatmentSteps)
      .set({ status: 'planned' })
      .where(and(eq(treatmentSteps.id, apt.treatmentStepId), eq(treatmentSteps.status, 'scheduled')));
  }

  await sendPatientNotification({
    patientId: apt.patientId,
    type: 'appointment_updated',
    title: 'Randevu İptal Edildi',
    body: `${apt.appointmentDate} tarihli randevunuz iptal edilmiştir. ${reason ? `Sebep: ${reason}` : ''}`,
  });

  await broadcastChange({ doctorId: apt.doctorId, patientId: apt.patientId });
  revalidatePath('/secretary/desk');
  return { success: true };
}

export async function getPatientPlannedStepsAction(patientId: string) {
  await requireSecretaryOrAdmin();

  const [plan] = await db
    .select({ id: treatmentPlans.id })
    .from(treatmentPlans)
    .where(
      and(
        eq(treatmentPlans.patientId, patientId),
        eq(treatmentPlans.status, 'active')
      )
    )
    .orderBy(desc(treatmentPlans.createdAt))
    .limit(1);

  if (!plan) return [];

  const steps = await db
    .select({
      id: treatmentSteps.id,
      title: treatmentSteps.title,
      price: treatmentSteps.price,
      durationMin: treatmentSteps.durationMin,
      fdiNumber: treatmentSteps.fdiNumber,
      status: treatmentSteps.status,
    })
    .from(treatmentSteps)
    .where(
      and(
        eq(treatmentSteps.planId, plan.id),
        eq(treatmentSteps.status, 'planned')
      )
    )
    .orderBy(treatmentSteps.stepOrder);

  return steps;
}

export async function getDoctorsListAction() {
  await requireSecretaryOrAdmin();

  return await db
    .select({
      id: doctorProfiles.id,
      title: doctorProfiles.title,
      fullName: staffUsers.fullName,
      branch: doctorProfiles.branch,
    })
    .from(doctorProfiles)
    .innerJoin(staffUsers, eq(doctorProfiles.staffUserId, staffUsers.id))
    .where(eq(staffUsers.isActive, true));
}

export async function getDoctorSlotsForDeskAction(doctorId: string, date: string, durationMin?: number) {
  await requireSecretaryOrAdmin();
  return getDoctorDaySlots(doctorId, date, durationMin);
}

export async function bookDirectSessionAction({
  patientId,
  doctorId,
  treatmentStepId,
  appointmentDate,
  startTime,
}: {
  patientId: string;
  doctorId: string;
  treatmentStepId: string;
  appointmentDate: string;
  startTime: string; // "14:00"
  /** @deprecated Süre tedavi adımından sunucuda okunur. */
  durationMin?: number;
}): Promise<{ success: true; appointmentId: string } | { success: false; error: string }> {
  await requireSecretaryOrAdmin();

  // Adım bu hastanın aktif planına ait ve henüz randevulanmamış olmalı
  const [step] = await db
    .select({
      id: treatmentSteps.id,
      title: treatmentSteps.title,
      status: treatmentSteps.status,
      durationMin: treatmentSteps.durationMin,
    })
    .from(treatmentSteps)
    .innerJoin(treatmentPlans, eq(treatmentSteps.planId, treatmentPlans.id))
    .where(and(eq(treatmentSteps.id, treatmentStepId), eq(treatmentPlans.patientId, patientId)))
    .limit(1);

  if (!step) {
    return { success: false, error: 'Tedavi adımı bu hastaya ait değil.' };
  }
  if (step.status !== 'planned') {
    return { success: false, error: 'Bu tedavi adımı için zaten randevu verilmiş veya ödemesi alınmış.' };
  }

  const durationMin = step.durationMin || 30;
  const slotError = await validateBookableSlot({
    doctorId,
    date: appointmentDate,
    startTime,
    durationMin,
    maxDaysAhead: 180,
  });
  if (slotError) {
    return { success: false, error: slotError };
  }

  const formattedStartTime = `${startTime.slice(0, 5)}:00`;
  const endTime = computeEndTime(startTime, durationMin);

  let newApt: { id: string };
  try {
    newApt = await db.transaction(async (tx) => {
    const locked = await tx
      .update(treatmentSteps)
      .set({ status: 'scheduled' })
      .where(and(eq(treatmentSteps.id, treatmentStepId), eq(treatmentSteps.status, 'planned')))
      .returning({ id: treatmentSteps.id });

    if (locked.length === 0) {
      throw new Error('STEP_TAKEN');
    }

    // Banko teyitli seans: ön talep beklemeden doğrudan 'confirmed'
    const [created] = await tx
      .insert(appointments)
      .values({
        patientId,
        doctorId,
        treatmentStepId,
        appointmentDate,
        startTime: formattedStartTime,
        endTime,
        durationMin,
        visitType: 'treatment_session',
        status: 'confirmed',
        createdBy: 'secretary',
      })
      .returning();
    return created;
  });
  } catch (err) {
    if (err instanceof Error && err.message === 'STEP_TAKEN') {
      return { success: false, error: 'Bu tedavi adımı için zaten randevu verilmiş.' };
    }
    throw err;
  }

  // Notify patient
  await sendPatientNotification({
    patientId,
    type: 'appointment_confirmed',
    title: '🗓️ Yeni Seans Randevunuz Oluşturuldu',
    body: `${appointmentDate} saat ${startTime} tarihinde ${step ? step.title : 'tedavi seansı'} randevunuz bankoda onaylanmıştır.`,
  });

  await broadcastChange({ doctorId, patientId });
  revalidatePath('/secretary/desk');
  revalidatePath('/patient');
  revalidatePath('/doctor/calendar');
  return { success: true, appointmentId: newApt.id };
}
