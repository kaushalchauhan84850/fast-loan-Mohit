import { useCallback, useEffect, useRef, useState } from 'react';

/** Simple seconds countdown for OTP resend timers. */
export function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds) => {
      clear();
      setSecondsLeft(seconds);
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clear();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    [clear]
  );

  useEffect(() => clear, [clear]);

  return { secondsLeft, start };
}
