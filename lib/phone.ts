// Telefon numarasını +90XXXXXXXXXX biçimine getirir (istemci ve sunucu).
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) return '+' + digits;
  if (digits.startsWith('0') && digits.length === 11) return '+9' + digits;
  if (digits.length === 10) return '+90' + digits;
  return '+' + digits;
}

/** Türkiye cep telefonu: +905XXXXXXXXX */
export function isValidTrMobile(phone: string): boolean {
  return /^\+905\d{9}$/.test(phone);
}
