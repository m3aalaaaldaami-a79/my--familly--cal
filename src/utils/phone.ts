import type { CountryCodeOption } from '../types/family';

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+964', countryAr: 'العراق (+964)', placeholder: '0770 123 4567' },
  { code: '+966', countryAr: 'السعودية (+966)', placeholder: '050 123 4567' },
  { code: '+971', countryAr: 'الإمارات (+971)', placeholder: '050 123 4567' },
  { code: '+20', countryAr: 'مصر (+20)', placeholder: '010 1234 5678' },
  { code: '+962', countryAr: 'الأردن (+962)', placeholder: '079 123 4567' },
  { code: '+965', countryAr: 'الكويت (+965)', placeholder: '9001 2345' },
  { code: '+974', countryAr: 'قطر (+974)', placeholder: '5012 3456' },
  { code: '+973', countryAr: 'البحرين (+973)', placeholder: '3612 3456' },
  { code: '+968', countryAr: 'عُمان (+968)', placeholder: '9123 4567' },
  { code: '+961', countryAr: 'لبنان (+961)', placeholder: '70 123 456' },
  { code: '+970', countryAr: 'فلسطين (+970)', placeholder: '059 123 4567' },
  { code: '+963', countryAr: 'سوريا (+963)', placeholder: '093 123 4567' },
  { code: '+212', countryAr: 'المغرب (+212)', placeholder: '0612 345678' },
  { code: '+213', countryAr: 'الجزائر (+213)', placeholder: '0551 234567' },
  { code: '+216', countryAr: 'تونس (+216)', placeholder: '20 123 456' },
  { code: '+44', countryAr: 'بريطانيا (+44)', placeholder: '07700 900077' },
  { code: '+1', countryAr: 'أمريكا / كندا (+1)', placeholder: '202 555 0143' },
];

const ARABIC_INDIC_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

export function toAsciiDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (ch) => ARABIC_INDIC_MAP[ch] ?? ch);
}

/**
 * Normalizes a raw phone number (with optional Arabic digits, spaces, dashes,
 * 00-prefix, or local leading 0) into an E.164 phone number like +9647701234567.
 */
export function normalizePhoneNumber(
  rawPhone: string,
  defaultCountryCode = '+964'
): string {
  const ascii = toAsciiDigits(rawPhone).trim();
  if (!ascii) return '';

  const cleanDefaultCode = defaultCountryCode.startsWith('+')
    ? `+${defaultCountryCode.replace(/\D/g, '')}`
    : `+${defaultCountryCode.replace(/\D/g, '')}`;

  // Preserve leading '+' if user explicitly entered international format
  const hasPlus = ascii.startsWith('+');
  let digits = ascii.replace(/\D/g, '');

  if (!digits) return '';

  if (hasPlus) {
    return `+${digits}`;
  }

  // Handle 00 international prefix (e.g. 009647701234567)
  if (digits.startsWith('00') && digits.length > 6) {
    return `+${digits.slice(2)}`;
  }

  const defaultDialDigits = cleanDefaultCode.replace(/\D/g, '');

  // If user pasted number already starting with country code without '+' (e.g. 9647701234567)
  if (
    defaultDialDigits &&
    digits.startsWith(defaultDialDigits) &&
    digits.length >= defaultDialDigits.length + 7
  ) {
    return `+${digits}`;
  }

  // Local leading 0 (e.g. 07701234567 -> +9647701234567)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (!digits) return '';

  return `${cleanDefaultCode}${digits}`;
}

export function validatePhoneNumber(
  rawPhone: string,
  defaultCountryCode = '+964'
): { valid: boolean; normalized: string; error?: string } {
  const normalized = normalizePhoneNumber(rawPhone, defaultCountryCode);
  const digitsOnly = normalized.replace(/\D/g, '');

  if (!normalized || digitsOnly.length === 0) {
    return {
      valid: false,
      normalized: '',
      error: 'يرجى إدخال رقم الهاتف.',
    };
  }

  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return {
      valid: false,
      normalized,
      error: 'رقم الهاتف غير مكتمل. تأكد من كتابة الرقم مع رمز البلد أو بدونه.',
    };
  }

  return {
    valid: true,
    normalized,
  };
}

function groupLocalDigits(local: string): string {
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (local.length === 9) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (local.length === 8) {
    return `${local.slice(0, 4)} ${local.slice(4)}`;
  }
  return local.replace(/(\d{3})(?=\d{2})/g, '$1 ').trim();
}

/**
 * Formats an E.164 number cleanly for LTR display inside an RTL UI.
 */
export function formatDisplayPhone(e164Phone: string): string {
  const normalized = normalizePhoneNumber(e164Phone);
  if (!normalized) return '';
  const digits = normalized.slice(1);

  // Match known country codes cleanly for visual grouping
  const matchedCountry = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((c) => normalized.startsWith(c.code));

  if (matchedCountry) {
    const codeDigits = matchedCountry.code.slice(1);
    const local = digits.slice(codeDigits.length);
    return `+${codeDigits} ${groupLocalDigits(local)}`;
  }

  return `+${groupLocalDigits(digits)}`;
}

/**
 * Regular cellular voice call URI (tel:)
 */
export function buildCallUri(e164Phone: string): string {
  const normalized = normalizePhoneNumber(e164Phone);
  return `tel:${normalized}`;
}

/**
 * WhatsApp direct link (https://wa.me/<digits>)
 */
export function buildWhatsAppUri(e164Phone: string, message?: string): string {
  const normalized = normalizePhoneNumber(e164Phone);
  const digitsOnly = normalized.replace(/\D/g, '');
  const base = `https://wa.me/${digitsOnly}`;
  if (message && message.trim().length > 0) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}

/**
 * Viber call or chat URI scheme
 */
export function buildViberUri(
  e164Phone: string,
  mode: 'call' | 'chat' = 'call'
): string {
  const normalized = normalizePhoneNumber(e164Phone);
  const encoded = encodeURIComponent(normalized);
  return mode === 'chat'
    ? `viber://chat?number=${encoded}`
    : `viber://call?number=${encoded}`;
}

/**
 * SMS URI fallback
 */
export function buildSmsUri(e164Phone: string, message?: string): string {
  const normalized = normalizePhoneNumber(e164Phone);
  if (message && message.trim().length > 0) {
    return `sms:${normalized}?body=${encodeURIComponent(message.trim())}`;
  }
  return `sms:${normalized}`;
}

/**
 * Splits an existing E.164 phone into matching country code and local portion for editing.
 */
export function splitPhoneForEditing(e164Phone: string): {
  countryCode: string;
  localNumber: string;
} {
  const normalized = normalizePhoneNumber(e164Phone);
  const matched = [...COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((c) => normalized.startsWith(c.code));

  if (matched) {
    return {
      countryCode: matched.code,
      localNumber: normalized.slice(matched.code.length),
    };
  }

  return {
    countryCode: '+964',
    localNumber: normalized,
  };
}
