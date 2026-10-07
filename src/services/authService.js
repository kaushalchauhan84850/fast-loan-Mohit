/**
 * Auth service — talks to the mock API today, a real backend tomorrow.
 * Swap each function body for a fetch() call keeping the same signature.
 */
import { request, hashPassword, randomId } from './mockApi.js';
import { isValidMobile } from '../utils/validators.js';

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    mobile: user.mobile,
    email: user.email,
    mobileVerified: !!user.mobileVerified,
    createdAt: user.createdAt,
  };
}

function createSession(db, user) {
  const token = randomId('tok');
  db.sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };
  return { token, user: publicUser(user) };
}

function findByIdentifier(db, identifier) {
  const id = String(identifier || '').trim().toLowerCase();
  const digits = id.replace(/\D/g, '');
  return db.users.find(
    (u) => u.email.toLowerCase() === id || (digits.length === 10 && u.mobile === digits)
  );
}

/** Create an unverified account. OTP verification follows. */
export async function signup({ fullName, mobile, email, password }) {
  return request((db) => {
    if (db.users.some((u) => u.mobile === mobile)) {
      throw new Error('An account with this mobile number already exists. Try logging in.');
    }
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists. Try logging in.');
    }
    const user = {
      id: randomId('u'),
      fullName: fullName.trim(),
      mobile,
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      mobileVerified: false,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return publicUser(user);
  });
}

/**
 * Send an OTP to a mobile number.
 * A real backend sends this via an SMS gateway (MSG91/Twilio) and NEVER
 * returns the code; the mock returns devOtp so the demo is self-service.
 */
export async function sendOtp(mobile, purpose = 'signup') {
  if (!isValidMobile(mobile)) throw new Error('Enter a valid mobile number');
  return request((db) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    db.otps[mobile] = {
      code,
      purpose,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    };
    // eslint-disable-next-line no-console
    console.info(`[mock SMS] OTP ${code} sent to +91 ${mobile} (${purpose})`);
    return { sent: true, expiresInSeconds: OTP_TTL_MS / 1000, devOtp: code };
  });
}

function consumeOtp(db, mobile, code) {
  const record = db.otps[mobile];
  if (!record) throw new Error('No OTP was requested. Please resend and try again.');
  if (Date.now() > record.expiresAt) throw new Error('This OTP has expired. Please request a new one.');
  if (record.attempts >= MAX_OTP_ATTEMPTS) throw new Error('Too many wrong attempts. Please request a new OTP.');
  if (record.code !== String(code)) {
    record.attempts += 1;
    throw new Error('Incorrect OTP. Please check and try again.');
  }
  delete db.otps[mobile];
}

/** Verify signup OTP: marks the account verified and starts a session. */
export async function verifySignupOtp(mobile, code) {
  return request((db) => {
    const user = db.users.find((u) => u.mobile === mobile);
    if (!user) throw new Error('Account not found. Please sign up again.');
    consumeOtp(db, mobile, code);
    user.mobileVerified = true;
    return createSession(db, user);
  });
}

/** Login with mobile-or-email + password. */
export async function loginWithPassword(identifier, password) {
  return request((db) => {
    const user = findByIdentifier(db, identifier);
    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid credentials. Check your mobile/email and password.');
    }
    if (!user.mobileVerified) {
      throw new Error('MOBILE_UNVERIFIED');
    }
    return createSession(db, user);
  });
}

/** Send a login OTP to the mobile behind an email/mobile identifier. */
export async function sendLoginOtp(identifier) {
  return request((db) => {
    const user = findByIdentifier(db, identifier);
    if (!user) throw new Error('No account found for this mobile/email.');
    return sendOtp(user.mobile, 'login');
  });
}

/** Verify login OTP: the identifier resolves the user, the OTP the mobile. */
export async function verifyLoginOtp(identifier, code) {
  return request(async (db) => {
    const user = findByIdentifier(db, identifier);
    if (!user) throw new Error('No account found for this mobile/email.');
    consumeOtp(db, user.mobile, code);
    user.mobileVerified = true;
    return createSession(db, user);
  });
}

/** Restore a session from a stored token (app bootstrap). */
export async function resumeSession(token) {
  return request((db) => {
    const session = db.sessions[token];
    if (!session) return null;
    const user = db.users.find((u) => u.id === session.userId);
    return user ? publicUser(user) : null;
  });
}

export async function logout(token) {
  return request((db) => {
    delete db.sessions[token];
    return { success: true };
  });
}
