// Canlı güncelleme "ping"leri (Supabase Realtime Broadcast).
// Yalnızca İÇERİKSİZ bir "değişti" sinyali yayınlanır; istemci veriyi yetkili Server Action ile yeniden çeker.
// Böylece anon anahtarla dinleyen biri hasta verisi göremez (KVKK).

export type LiveTopic = 'desk' | `doctor-${string}` | `patient-${string}`;

export function liveTopicsFor({ doctorId, patientId }: { doctorId?: string | null; patientId?: string | null }) {
  const topics: LiveTopic[] = ['desk'];
  if (doctorId) topics.push(`doctor-${doctorId}`);
  if (patientId) topics.push(`patient-${patientId}`);
  return topics;
}

/** Hata fırlatmaz; Realtime erişilemezse istemciler yedek periyodik yenilemeyle devam eder. */
export async function broadcastChange(target: { doctorId?: string | null; patientId?: string | null }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;

  const messages = liveTopicsFor(target).map((topic) => ({ topic, event: 'changed', payload: {} }));
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(2500),
    });
  } catch (err) {
    console.warn('Realtime broadcast gönderilemedi:', err);
  }
}
