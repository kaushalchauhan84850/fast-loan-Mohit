/**
 * Mock backend core.
 *
 * Everything here simulates the real backend behind realistic latency and
 * persists to localStorage, so the app survives refreshes. When the real
 * API is ready, delete this file and point the services at fetch() calls —
 * the rest of the app only talks to authService/loanService/kycService.
 *
 * SECURITY NOTE: this is a browser mock. A real backend must hash passwords
 * with bcrypt/argon2 server-side, send OTPs over an SMS gateway, and store
 * Aadhaar/PAN only in encrypted vaults. The frontend never persists full
 * Aadhaar numbers anywhere (see KYC flow).
 */
import { LOAN_CONFIG, buildEmiSchedule, calculateEmi, dateOnly, addMonths, isoDate, round2 } from '../utils/interest.js';

const DB_KEY = 'tl_mock_db_v1';
const MIN_LATENCY = 250;
const MAX_LATENCY = 650;

const hasLocalStorage = typeof window !== 'undefined' && !!window.localStorage;

/** Simulated network latency so skeletons and spinners behave realistically. */
export function delay(ms) {
  const wait = ms ?? MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY);
  return new Promise((resolve) => setTimeout(resolve, wait));
}

/**
 * MOCK ONLY — stand-in for server-side bcrypt/argon2 hashing.
 * Never do password "hashing" like this in production frontend code.
 */
export function hashPassword(password) {
  return `mock$${btoa(unescape(encodeURIComponent(`tl:${password}`)))}`;
}

export function randomId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/* ------------------------------- seed data ------------------------------- */

function seedDb() {
  const now = new Date();

  // Demo loan: EMI #1 paid on time, EMI #2 due 6 days ago
  // (3 days past grace → penalty accrues, so the late-fee UI is visible).
  const emi2Due = dateOnly(now);
  emi2Due.setDate(emi2Due.getDate() - 6);
  const startDate = addMonths(emi2Due, -1);

  const principal = 200000;
  const rate = LOAN_CONFIG.monthlyInterestRate;
  const tenure = 12;
  const schedule = buildEmiSchedule(principal, rate, tenure, startDate);
  const emi1 = schedule[0];

  const demoUser = {
    id: 'u_demo',
    fullName: 'Aarav Sharma',
    mobile: '9876543210',
    email: 'demo@trustlend.in',
    passwordHash: hashPassword('Demo@1234'),
    mobileVerified: true,
    createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
  };

  const loan = {
    id: 'l_demo',
    userId: demoUser.id,
    principal,
    monthlyInterestRate: rate,
    tenure,
    startDate: isoDate(startDate),
    purpose: 'personal',
    status: 'active',
    disbursedAt: isoDate(startDate),
  };

  const paidAt = dateOnly(addMonths(startDate, 1));
  paidAt.setDate(paidAt.getDate() - 1); // paid one day before due

  const payments = [
    {
      id: 'p_demo1',
      userId: demoUser.id,
      loanId: loan.id,
      emiNo: 1,
      amount: emi1.emi,
      principal: emi1.principal,
      interest: emi1.interest,
      penalty: 0,
      method: 'upi',
      paidAt: paidAt.toISOString(),
    },
  ];

  return {
    users: [demoUser],
    otps: {}, // mobile -> { code, expiresAt, attempts, purpose }
    sessions: {}, // token -> { userId, createdAt }
    applications: [
      {
        // A second, in-flight application (top-up) so the status tracker has content.
        id: 'a_demo',
        userId: demoUser.id,
        personal: {
          fullName: 'Aarav Sharma',
          dob: '1993-04-18',
          employmentType: 'salaried',
          monthlyIncome: 65000,
          address: '14, Rose Villa, MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
        },
        loan: { amount: 150000, tenure: 12, purpose: 'personal' },
        kyc: {
          pan: 'ABCDE1234F',
          aadhaarLast4: '2346',
          panDocRef: 'DOC_demo_pan',
          aadhaarDocRef: 'DOC_demo_aadhaar',
          selfieRef: 'DOC_demo_selfie',
          faceVerified: true,
        },
        status: 'under_review',
        submittedAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      },
    ],
    loans: [loan],
    payments,
  };
}

/* ------------------------------- db access ------------------------------- */

function loadDb() {
  if (hasLocalStorage) {
    try {
      const raw = window.localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* fall through to reseed */
    }
  }
  const seeded = seedDb();
  saveDb(seeded);
  return seeded;
}

function saveDb(db) {
  if (hasLocalStorage) {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {
      /* storage full/disabled — app still works in-memory */
    }
  }
}

let _db = null;
export function getDb() {
  if (!_db) _db = loadDb();
  return _db;
}

/** Wipe mock data and reseed (used by tests / a "reset demo" affordance). */
export function resetMockDb() {
  _db = null;
  if (hasLocalStorage) window.localStorage.removeItem(DB_KEY);
}

/** Run a handler against the db after simulated latency; persists after mutation. */
export async function request(handler) {
  await delay();
  const db = getDb();
  const result = await handler(db);
  saveDb(db);
  return result;
}
