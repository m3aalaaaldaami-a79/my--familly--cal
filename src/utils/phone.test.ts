import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCallUri,
  buildSmsUri,
  buildViberUri,
  buildWhatsAppUri,
  formatDisplayPhone,
  normalizePhoneNumber,
  splitPhoneForEditing,
  toAsciiDigits,
  validatePhoneNumber,
} from './phone';

test('toAsciiDigits converts Arabic-Indic and Persian digits', () => {
  assert.equal(toAsciiDigits('٠٧٧٠١٢٣٤٥٦٧'), '07701234567');
  assert.equal(toAsciiDigits('۰۵۰۱۲۳۴۵۶۷'), '0501234567');
});

test('normalizePhoneNumber handles local, 00-prefix, +prefix, and Arabic numerals', () => {
  assert.equal(normalizePhoneNumber('0770 123 4567', '+964'), '+9647701234567');
  assert.equal(normalizePhoneNumber('٠٧٧٠١٢٣٤٥٦٧', '+964'), '+9647701234567');
  assert.equal(normalizePhoneNumber('00966501234567', '+964'), '+966501234567');
  assert.equal(normalizePhoneNumber('+971-50-123-4567', '+964'), '+971501234567');
  assert.equal(normalizePhoneNumber('9647701234567', '+964'), '+9647701234567');
});

test('validatePhoneNumber rejects empty or too-short numbers', () => {
  assert.equal(validatePhoneNumber('', '+964').valid, false);
  assert.equal(validatePhoneNumber('1234', '+964').valid, false);
  const ok = validatePhoneNumber('0501234567', '+966');
  assert.equal(ok.valid, true);
  assert.equal(ok.normalized, '+966501234567');
});

test('deep link builders emit correct tel, wa.me, viber, and sms URIs', () => {
  const num = '+9647701234567';
  assert.equal(buildCallUri(num), 'tel:+9647701234567');
  assert.equal(buildWhatsAppUri(num), 'https://wa.me/9647701234567');
  assert.equal(
    buildWhatsAppUri(num, 'السلام عليكم'),
    'https://wa.me/9647701234567?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85'
  );
  assert.equal(
    buildViberUri(num, 'call'),
    'viber://call?number=%2B9647701234567'
  );
  assert.equal(
    buildViberUri(num, 'chat'),
    'viber://chat?number=%2B9647701234567'
  );
  assert.equal(buildSmsUri(num), 'sms:+9647701234567');
});

test('formatDisplayPhone and splitPhoneForEditing preserve country code cleanly', () => {
  assert.equal(formatDisplayPhone('+9647701234567'), '+964 770 123 4567');
  assert.deepEqual(splitPhoneForEditing('+966501234567'), {
    countryCode: '+966',
    localNumber: '501234567',
  });
});
