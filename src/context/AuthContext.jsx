import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authService from '../services/authService.js';
import { storageGet, storageSet, storageRemove } from '../utils/storage.js';

const SESSION_KEY = 'tl_session';
const AuthContext = createContext(null);

/**
 * Holds the authenticated user. The session token lives in localStorage
 * (swap for httpOnly cookies when the real backend lands); the user object
 * contains no secrets and no Aadhaar data.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const stored = storageGet(SESSION_KEY);
    if (stored?.token) {
      authService
        .resumeSession(stored.token)
        .then((restored) => {
          if (!cancelled) setUser(restored);
          if (!restored) storageRemove(SESSION_KEY);
        })
        .catch(() => storageRemove(SESSION_KEY))
        .finally(() => {
          if (!cancelled) setInitializing(false);
        });
    } else {
      setInitializing(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback((session) => {
    storageSet(SESSION_KEY, { token: session.token, at: Date.now() });
    setUser(session.user);
    return session.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,

      async signup(payload) {
        return authService.signup(payload);
      },

      /** Returns { devOtp } from the mock; real backends return nothing. */
      async sendOtp(mobile, purpose) {
        return authService.sendOtp(mobile, purpose);
      },

      async verifySignupOtp(mobile, code) {
        const session = await authService.verifySignupOtp(mobile, code);
        return persistSession(session);
      },

      async loginWithPassword(identifier, password) {
        const session = await authService.loginWithPassword(identifier, password);
        return persistSession(session);
      },

      async sendLoginOtp(identifier) {
        return authService.sendLoginOtp(identifier);
      },

      async verifyLoginOtp(identifier, code) {
        const session = await authService.verifyLoginOtp(identifier, code);
        return persistSession(session);
      },

      async logout() {
        const stored = storageGet(SESSION_KEY);
        storageRemove(SESSION_KEY);
        setUser(null);
        if (stored?.token) {
          try {
            await authService.logout(stored.token);
          } catch {
            /* session already gone server-side */
          }
        }
      },
    }),
    [user, initializing, persistSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
