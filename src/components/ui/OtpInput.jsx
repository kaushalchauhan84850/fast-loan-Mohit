import { forwardRef, useRef } from 'react';

/**
 * 6-box OTP input. Value is a plain string controlled by the parent.
 * Supports typing, backspace navigation, arrow keys and full-code paste.
 */
const OtpInput = forwardRef(function OtpInput(
  { value = '', onChange, length = 6, disabled = false, autoComplete = 'one-time-code', name = 'otp', label = 'Enter 6-digit OTP' },
  ref
) {
  const boxesRef = useRef([]);

  const setDigit = (index, digit) => {
    const chars = value.padEnd(length, ' ').split('');
    chars[index] = digit || ' ';
    const next = chars.join('').replace(/ /g, '').replace(/(\d{6}).*/, '$1');
    onChange(next.slice(0, length));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        setDigit(index, '');
      } else if (index > 0) {
        setDigit(index - 1, '');
        boxesRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      boxesRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      boxesRef.current[index + 1]?.focus();
    }
  };

  const handleChange = (e, index) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    if (raw.length > 1) {
      // multi-char (paste or fast typing): distribute across boxes
      const merged = (value.slice(0, index) + raw).replace(/\D/g, '').slice(0, length);
      onChange(merged);
      boxesRef.current[Math.min(merged.length, length - 1)]?.focus();
      return;
    }
    setDigit(index, raw);
    if (index < length - 1) boxesRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      boxesRef.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  return (
    <div>
      <span className="sr-only" id="otp-label">{label}</span>
      <input
        ref={ref}
        type="hidden"
        name={name}
        value={value}
        autoComplete={autoComplete}
        aria-labelledby="otp-label"
        readOnly
        tabIndex={-1}
      />
      <div className="flex gap-2 sm:gap-3" role="group" aria-labelledby="otp-label" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              boxesRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            disabled={disabled}
            value={value[i] ?? ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={`h-12 w-11 rounded-xl border text-center text-lg font-bold text-navy-900 transition-colors sm:h-14 sm:w-12 ${
              value[i]
                ? 'border-emerald-500 bg-emerald-50/60'
                : 'border-navy-200 bg-white hover:border-navy-300'
            } focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60`}
          />
        ))}
      </div>
    </div>
  );
});

export default OtpInput;
