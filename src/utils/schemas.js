/**
 * Zod schemas shared by React Hook Form across pages.
 * Keep schemas here so validation rules are single-sourced and testable.
 */
import { z } from 'zod';
import { isValidPAN, isValidAadhaar, isValidMobile } from './validators.js';

export const mobileSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => isValidMobile(v), 'Enter a valid 10-digit Indian mobile number');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const signupSchema = z.object({
  fullName: z.string().trim().min(3, 'Enter your full name (min 3 characters)').max(80),
  mobile: mobileSchema,
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the Terms & Privacy Policy to continue' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(4, 'Enter your registered mobile number or email')
    .refine(
      (v) => isValidMobile(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Enter a valid mobile number or email address'
    ),
  password: z.string().min(1, 'Enter your password'),
});

export const loginOtpIdentifierSchema = loginSchema.pick({ identifier: true });

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit OTP');

/* ----------------------------- KYC address blocks ----------------------------- */

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'UAE', 'Singapore', 'Other'];

export const addressSchema = z
  .object({
    line1: z.string().trim().min(5, 'Address line 1 is required (min 5 characters)').max(100),
    line2: z.string().trim().max(100, 'Address line 2 is too long').optional().or(z.literal('')),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().min(2, 'State is required'),
    postalCode: z
      .string()
      .trim()
      .min(3, 'Postal code is required')
      .max(10, 'Postal code is too long')
      .regex(/^[A-Za-z0-9][A-Za-z0-9 -]*$/, 'Enter a valid postal code'),
    country: z.enum(COUNTRIES, { errorMap: () => ({ message: 'Select a country' }) }),
  })
  .refine(
    (a) => a.country !== 'India' || /^\d{6}$/.test(a.postalCode),
    { message: 'Indian addresses need a valid 6-digit PIN code', path: ['postalCode'] }
  );

export const COUNTRY_OPTIONS = COUNTRIES;

/* ----------------------------- Loan application steps ----------------------------- */

export const personalDetailsSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Enter your full name as per Aadhaar'),
    dob: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((v) => {
        const dob = new Date(v);
        if (Number.isNaN(dob.getTime())) return false;
        const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
        return age >= 18 && age <= 65;
      }, 'Age must be between 18 and 65 years'),
    employmentType: z.enum(['salaried', 'self-employed', 'business', 'student', 'retired'], {
      errorMap: () => ({ message: 'Select your employment type' }),
    }),
    monthlyIncome: z.coerce
      .number({ invalid_type_error: 'Enter your monthly income' })
      .min(0, 'Income cannot be negative')
      .max(10000000, 'Income looks too large'),
    // KYC: permanent address
    permanentAddress: addressSchema,
    // KYC: current/destination address
    sameAsPermanent: z.boolean(),
    currentAddress: addressSchema,
  })
  .refine(
    (data) => !data.sameAsPermanent || JSON.stringify(data.currentAddress) === JSON.stringify(data.permanentAddress),
    { message: 'Current address must match the permanent address', path: ['currentAddress'] }
  );

/** Single-cycle loan: amount + purpose only. No tenure. */
export const loanDetailsSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Enter a loan amount' })
    .int('Amount must be a whole number')
    .min(10000, 'Minimum loan amount is ₹10,000')
    .max(500000, 'Maximum loan amount is ₹5,00,000'),
  purpose: z.enum(['personal', 'business', 'education', 'home-renovation', 'medical', 'other'], {
    errorMap: () => ({ message: 'Select the purpose of your loan' }),
  }),
});

export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((v) => isValidPAN(v), 'Enter a valid PAN in the format ABCDE1234F');

export const aadhaarSchema = z
  .string()
  .trim()
  .refine((v) => isValidAadhaar(v), 'Enter a valid 12-digit Aadhaar number');
