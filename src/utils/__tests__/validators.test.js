import { describe, it, expect } from 'vitest';
import {
  isValidPAN,
  isValidAadhaar,
  isValidVerhoeff,
  verhoeffCheckDigit,
  isValidMobile,
  maskAadhaar,
  maskPan,
  maskMobile,
} from '../validators.js';

describe('Verhoeff', () => {
  it('accepts known-valid check numbers', () => {
    expect(isValidVerhoeff('2363')).toBe(true);
    expect(isValidVerhoeff('0')).toBe(true);
  });

  it('rejects corrupted numbers', () => {
    expect(isValidVerhoeff('2364')).toBe(false);
    expect(isValidVerhoeff('')).toBe(false);
    expect(isValidVerhoeff('12a4')).toBe(false);
  });

  it('check digit makes any payload valid', () => {
    const payload = '23412341234';
    const full = payload + verhoeffCheckDigit(payload);
    expect(isValidVerhoeff(full)).toBe(true);
    expect(verhoeffCheckDigit('')).toBe(0);
  });
});

describe('PAN validation', () => {
  it('accepts the canonical format ABCDE1234F', () => {
    expect(isValidPAN('ABCDE1234F')).toBe(true);
    expect(isValidPAN('BXKPS1234A')).toBe(true);
  });

  it('rejects malformed PANs', () => {
    expect(isValidPAN('ABCD1234F')).toBe(false); // 4 letters
    expect(isValidPAN('ABCDE12345')).toBe(false); // ends with digit
    expect(isValidPAN('abcde1234f')).toBe(true); // lowercase is normalised internally
    expect(isValidPAN('')).toBe(false);
    expect(isValidPAN('ABCDE123F')).toBe(false); // 3 digits
  });
});

describe('Aadhaar validation', () => {
  const valid12 = '23412341234' + verhoeffCheckDigit('23412341234');

  it('accepts a 12-digit Verhoeff-valid number', () => {
    expect(isValidAadhaar(valid12)).toBe(true);
    expect(isValidAadhaar(valid12.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3'))).toBe(true); // spaces tolerated
  });

  it('rejects wrong checksum, wrong length and disallowed leading digits', () => {
    expect(isValidAadhaar('123456789012')).toBe(false); // checksum fail
    expect(isValidAadhaar('2341234123')).toBe(false); // 10 digits
    expect(isValidAadhaar('0' + valid12.slice(1))).toBe(false); // leading 0 rejected by policy
    expect(isValidAadhaar('1' + valid12.slice(1))).toBe(false); // leading 1 rejected by policy
    expect(isValidAadhaar('')).toBe(false);
  });
});

describe('Mobile validation', () => {
  it('accepts Indian mobiles starting 6-9', () => {
    expect(isValidMobile('9876543210')).toBe(true);
    expect(isValidMobile('6123456789')).toBe(true);
  });
  it('rejects other patterns', () => {
    expect(isValidMobile('1234567890')).toBe(false); // starts with 1
    expect(isValidMobile('987654321')).toBe(false); // 9 digits
    expect(isValidMobile('98765432101')).toBe(false); // 11 digits
  });
});

describe('Masking', () => {
  it('masks Aadhaar to last 4 only', () => {
    expect(maskAadhaar('4321')).toBe('XXXX XXXX 4321');
  });
  it('masks PAN keeping edges', () => {
    expect(maskPan('ABCDE1234F')).toBe('AB••••••4F');
  });
  it('masks mobile keeping prefix/suffix', () => {
    expect(maskMobile('9876543210')).toBe('98XXXXX210');
  });
});
