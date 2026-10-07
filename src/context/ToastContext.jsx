import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconCheckCircle, IconAlertTriangle, IconInfo, IconX } from '../components/ui/Icons.jsx';

const ToastContext = createContext(null);
let nextToastId = 1;

const ICONS = {
  success: IconCheckCircle,
  error: IconAlertTriangle,
  info: IconInfo,
};

const TONES = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-navy-600',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, content, options = {}) => {
      const id = nextToastId++;
      const toast = {
        id,
        type,
        title: typeof content === 'string' ? content : content.title,
        message: typeof content === 'string' ? options.message : content.message,
      };
      setToasts((list) => [...list.slice(-3), toast]);
      window.setTimeout(() => dismiss(id), options.duration ?? 4500);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (content, options) => push('success', content, options),
      error: (content, options) => push('error', content, { duration: 6000, ...options }),
      info: (content, options) => push('info', content, options),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Screen-reader announcements for async results (WCAG 4.1.3) */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] ?? IconInfo;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 32 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-4 shadow-soft-lg"
                role="status"
              >
                <Icon size={20} className={`mt-0.5 shrink-0 ${TONES[toast.type]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900">{toast.title}</p>
                  {toast.message && <p className="mt-0.5 text-sm text-navy-600">{toast.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="rounded-md p-1 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                >
                  <IconX size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
