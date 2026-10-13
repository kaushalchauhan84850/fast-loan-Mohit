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
import {
  LOAN_CONFIG,
  calculateLoanTerms,
  calculateDues,
  dateOnly,
  isoDate,
} from '../utils/interest.js';

const DB_KEY = 'tl_mock_db_v2'; // v2: single-cycle loans + KYC addresses (reseeds)

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

function addDays(date, days) {
  const d = dateOnly(date);
  d.setDate(d.getDate() + days);
  return d;
}

const DEMO_ADDRESS = {
  line1: '14, Rose Villa, MG Road',
  line2: 'Near SBI ATM',
  city: 'Pune',
  state: 'Maharashtra',
  postalCode: '411001',
  country: 'India',
};

/* ------------------------------- seed data ------------------------------- */

function seedDb() {
  const now = new Date();

  const demoUser = {
    id: 'u_demo',
    fullName: 'Aarav Sharma',
    mobile: '9876543210',
    email: 'demo@trustlend.in',
    passwordHash: hashPassword('Demo@1234'),
    mobileVerified: true,
    createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
  };

  // Closed loan: disbursed 70 days ago, repaid in full one day before its due date.
  const paidDisbursed = addDays(now, -70);
  const paidTerms = calculateLoanTerms({ principal: 60000, disbursementDate: paidDisbursed });
  const paidLoan = {
    id: 'l_paid',
    userId: demoUser.id,
    principal: 60000,
    disbursementDate: isoDate(paidDisbursed),
    dueDate: paidTerms.dueDate,
    purpose: 'education',
    status: 'closed',
    closedAt: new Date(dateOnly(paidTerms.dueDate).getTime() - 86400000).toISOString(),
  };

  // Active loan: disbursed 50 days ago → due on a 28th that is at least 7 days
  // in the past (max window is 16th→next 28th = 43 days), so the overdue
  // penalty breakdown is always visible on the demo dashboard.
  const activeDisbursed = addDays(now, -50);
  const activeTerms = calculateLoanTerms({ principal: 200000, disbursementDate: activeDisbursed });
  const activeLoan = {
    id: 'l_demo',
    userId: demoUser.id,
    principal: 200000,
    disbursementDate: isoDate(activeDisbursed),
    dueDate: activeTerms.dueDate,
    purpose: 'personal',
    status: 'active',
  };

  const payments = [
    {
      id: 'p_demo1',
      userId: demoUser.id,
      loanId: paidLoan.id,
      amount: paidTerms.totalRepayable,
      principal: paidLoan.principal,
      interest: paidTerms.interest,
      penalty: 0,
      method: 'upi',
      paidAt: new Date(dateOnly(paidTerms.dueDate).getTime() - 86400000).toISOString(),
    },
  ];

  return {
    users: [demoUser],
    otps: {}, // mobile -> { code, expiresAt, attempts, purpose }
    sessions: {}, // token -> { userId, createdAt }
    applications: [
      {
        id: 'a_demo',
        userId: demoUser.id,
        personal: {
          fullName: 'Aarav Sharma',
          dob: '1993-04-18',
          employmentType: 'salaried',
          monthlyIncome: 65000,
          permanentAddress: DEMO_ADDRESS,
          sameAsPermanent: false,
          currentAddress: {
            ...DEMO_ADDRESS,
            line1: '7B, Sunrise Apartments, Koregaon Park',
            city: 'Pune',
            postalCode: '411001',
          },
        },
        loan: { amount: 150000, purpose: 'personal' },
        kyc: {
          pan: 'ABCDE1234F',
          aadhaarLast4: '2346',
          panDocRef: 'DOC_demo_pan',
          aadhaarDocRef: 'DOC_demo_aadhaar',
          selfieRef: 'DOC_demo_selfie',
          faceVerified: true,
          // Both addresses are part of the KYC record
          permanentAddress: DEMO_ADDRESS,
          currentAddress: {
            ...DEMO_ADDRESS,
            line1: '7B, Sunrise Apartments, Koregaon Park',
          },
        },
        status: 'under_review',
        submittedAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      },
    ],
    loans: [activeLoan, paidLoan],
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
