// Klinik saat dilimi yardımcıları.
// Sunucu (Docker / Cloudflare) genellikle UTC'de çalışır; tüm "bugün" ve
// "randevuya kaç dakika var" hesapları klinik saatine (Europe/Istanbul) göre yapılmalıdır.

export const CLINIC_TZ = 'Europe/Istanbul';

function clinicParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** Klinik saatine göre bugünün tarihi (YYYY-MM-DD). */
export function clinicToday(now: Date = new Date()): string {
  return clinicParts(now).date;
}

/** Klinik saatine göre bugünden `days` gün sonrası (YYYY-MM-DD). */
export function clinicDateOffset(days: number, now: Date = new Date()): string {
  const [y, m, d] = clinicToday(now).split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}

/** Randevu başlangıcına kalan dakika (geçmişse negatif). */
export function minutesUntilAppointment(
  appointmentDate: string,
  startTime: string,
  now: Date = new Date()
): number {
  const current = clinicParts(now);
  const [ay, am, ad] = appointmentDate.split('-').map(Number);
  const [cy, cm, cd] = current.date.split('-').map(Number);
  const dayDiff = Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(cy, cm - 1, cd)) / 86_400_000);
  const [h, min] = startTime.split(':').map(Number);
  return dayDiff * 1440 + (h * 60 + min) - current.minutes;
}

/** Erken geliş eşiği (dakika). */
export const EARLY_ARRIVAL_THRESHOLD_MIN = 30;
