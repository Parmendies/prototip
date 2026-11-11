'use server';

import { requireSecretaryOrAdmin } from '@/lib/auth/dal';
import { createRotatingKioskToken } from '@/lib/kiosk-token';

/** Kiosk tableti dönen check-in kodunu buradan alır (yalnızca banko personeli oturumuyla). */
export async function getKioskTokenAction() {
  await requireSecretaryOrAdmin();
  return createRotatingKioskToken();
}
