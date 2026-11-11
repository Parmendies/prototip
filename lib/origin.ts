import { headers } from 'next/headers';

/** İstek gelen site adresi (QR kodlarındaki mutlak URL için). Ters vekil arkasında x-forwarded-* kullanılır. */
export async function getRequestOrigin() {
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}
