/**
 * Identity validators: PAN, Aadhaar (with Verhoeff checksum), Indian mobile.
 * Pure functions — unit-tested in src/utils/__tests__/validators.test.js.
 */

/* ---------------------------------- Verhoeff ---------------------------------- */

const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/** Validate a numeric string with the Verhoeff checksum algorithm. */
export function isValidVerhoeff(numStr) {
  if (!/^\d+$/.test(String(numStr))) return false;
  let c = 0;
  const digits = String(numStr).split('').reverse().map(Number);
  digits.forEach((digit, i) => {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]];
  });
  return c === 0;
}

/** Compute the Verhoeff check digit that would make `numStr + digit` valid. */
export function verhoeffCheckDigit(numStr) {
  let c = 0;
  const digits = String(numStr).split('').reverse().map(Number);
  digits.forEach((digit, i) => {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][digit]];
  });
  return VERHOEFF_INV[c];
}

/* ---------------------------------- PAN / Aadhaar / Mobile ---------------------------------- */

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // e.g. ABCDE1234F
const MOBILE_REGEX = /^[6-9]\d{9}$/; // Indian mobile, 10 digits

/** PAN: 5 letters, 4 digits, 1 letter (ABCDE1234F). Input is uppercased by the UI. */
export function isValidPAN(pan) {
  return PAN_REGEX.test(String(pan || '').trim().toUpperCase());
}

/**
 * Aadhaar: 12 digits, must not start with 0/1 (UIDAI policy),
 * and must satisfy the Verhoeff checksum.
 */
export function isValidAadhaar(aadhaar) {
  const value = String(aadhaar || '').replace(/\s/g, '');
  return /^\d{12}$/.test(value) && value[0] !== '0' && value[0] !== '1' && isValidVerhoeff(value);
}

export function isValidMobile(mobile) {
  return MOBILE_REGEX.test(String(mobile || '').replace(/\D/g, ''));
}

/* ---------------------------------- Masking ---------------------------------- */

/** Aadhaar is never displayed or stored in full: XXXX XXXX 4321. */
export function maskAadhaar(last4) {
  return `XXXX XXXX ${String(last4).slice(-4)}`;
}

/** PAN masked for review screens: AB••••••4F style (keeps first 2 + last 2). */
export function maskPan(pan) {
  const p = String(pan || '').toUpperCase();
  if (p.length !== 10) return '••••••••••';
  return `${p.slice(0, 2)}••••••${p.slice(-2)}`;
}

export function maskMobile(mobile) {
  const m = String(mobile || '').replace(/\D/g, '');
  return m.length === 10 ? `${m.slice(0, 2)}XXXXX${m.slice(-3)}` : m;
}

/**
 * Deterministic demo Aadhaar that passes Verhoeff, used only for the
 * "try a demo number" hint in the KYC step. Generated from the algorithm,
 * so it is guaranteed valid.
 */
export const DEMO_AADHAAR = `23412341234${verhoeffCheckDigit('23412341234')}`;
