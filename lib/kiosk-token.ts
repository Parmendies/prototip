// Danışma QR'ı için HMAC imzalı fiziksel varlık kodu (yalnızca sunucu).
// - Tablet kiosk: 5 dakikada bir dönen kod ("t.<pencere>.<imza>"), mevcut + önceki pencere geçerli (5–10 dk).
// - Sabit pleksi stand: basılı, kalıcı kod ("s.<imza>"). Sızarsa KIOSK_HMAC_SECRET değiştirilerek iptal edilir.
import { createHmac, timingSafeEqual } from 'node:crypto';

const WINDOW_MS = 5 * 60_000;

function secret() {
  const s = process.env.KIOSK_HMAC_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') throw new Error('KIOSK_HMAC_SECRET tanımlı değil.');
    return 'dev-only-kiosk-secret';
  }
  return s;
}

function sign(data: string) {
  return createHmac('sha256', secret()).update(data).digest('base64url').slice(0, 22);
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function createRotatingKioskToken(now = Date.now()) {
  const w = Math.floor(now / WINDOW_MS);
  return { token: `t.${w}.${sign(`t:${w}`)}`, expiresAt: (w + 1) * WINDOW_MS };
}

export function createStaticKioskToken() {
  return `s.${sign('static')}`;
}

export function verifyKioskToken(token: string | null | undefined, now = Date.now()): boolean {
  if (!token || token.length > 64) return false;
  const parts = token.split('.');
  if (parts[0] === 's' && parts.length === 2) return safeEqual(parts[1], sign('static'));
  if (parts[0] === 't' && parts.length === 3) {
    const w = Number(parts[1]);
    const current = Math.floor(now / WINDOW_MS);
    if (!Number.isInteger(w) || w > current || w < current - 1) return false;
    return safeEqual(parts[2], sign(`t:${w}`));
  }
  return false;
}

// QR okutulduktan sonra hasta PIN girerken kod dönebilir; bu yüzden geçerli QR görülünce
// 30 dk geçerli imzalı bir "klinikte bulunma" kanıtı çereze yazılır.
export const PRESENCE_COOKIE = 'dp_presence';
export const PRESENCE_TTL_MS = 30 * 60_000;

export function createPresenceProof(now = Date.now()) {
  const exp = now + PRESENCE_TTL_MS;
  return `p.${exp}.${sign(`p:${exp}`)}`;
}

export function verifyPresenceProof(value: string | null | undefined, now = Date.now()): boolean {
  if (!value || value.length > 80) return false;
  const [kind, expStr, sig] = value.split('.');
  const exp = Number(expStr);
  if (kind !== 'p' || !Number.isFinite(exp) || exp < now || exp > now + PRESENCE_TTL_MS) return false;
  return !!sig && safeEqual(sig, sign(`p:${exp}`));
}
