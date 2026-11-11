import { requireSecretaryOrAdmin } from '@/lib/auth/dal';
import { createRotatingKioskToken } from '@/lib/kiosk-token';
import { getRequestOrigin } from '@/lib/origin';
import KioskClient from './KioskClient';

export const dynamic = 'force-dynamic';

// Kiosk QR'ı fiziksel varlık kanıtıdır: evden açılıp kod alınamasın diye yalnızca banko oturumuyla görünür.
export default async function KioskPage() {
  await requireSecretaryOrAdmin();
  return <KioskClient initialToken={createRotatingKioskToken()} origin={await getRequestOrigin()} />;
}
