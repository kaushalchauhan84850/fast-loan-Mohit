/**
 * Safe localStorage wrappers. Every access is guarded so the app still works
 * in private mode / when storage is full or disabled.
 *
 * SECURITY RULE: never persist Aadhaar numbers, OTP codes or passwords here.
 * Only session token, language preference and non-sensitive form drafts.
 */

export function storageGet(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
