import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { LOAN_CONFIG, calculateLoanTerms } from '../../utils/interest.js';
import { formatINR, formatDate } from '../../utils/format.js';
import { IconInfo, IconCalendar } from '../ui/Icons.jsx';

function SliderField({ label, value, min, max, step, onChange, format, id }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-navy-800">
          {label}
        </label>
        <output
          htmlFor={id}
          className="rounded-lg bg-navy-950 px-3 py-1 text-sm font-bold text-emerald-400"
        >
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-navy-100 accent-emerald-600"
        aria-valuetext={format(value)}
      />
      <div className="mt-1 flex justify-between text-xs text-navy-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

/**
 * Interactive loan calculator (reused on Home and /emi-calculator).
 * Single-cycle loan: amount slider → due date (28th rule), interest at
 * 0.8%/day and total repayment update live. Assumes disbursement today.
 */
export default function EmiCalculator({ className = '' }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [amount, setAmount] = useState(100000);

  const terms = useMemo(
    () => calculateLoanTerms({ principal: amount, disbursementDate: new Date() }),
    [amount]
  );

  const applyHref = `/apply?amount=${amount}`;

  return (
    <Card className={`p-6 sm:p-8 ${className}`}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* inputs */}
        <div className="space-y-7">
          <SliderField
            id="calc-amount"
            label={t('calc.amount')}
            value={amount}
            min={LOAN_CONFIG.minAmount}
            max={LOAN_CONFIG.maxAmount}
            step={5000}
            onChange={setAmount}
            format={(v) => formatINR(v)}
          />

          <div className="grid gap-3 rounded-xl border border-navy-100 bg-navy-50/70 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <IconCalendar size={16} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-navy-600">
                <strong className="block text-navy-800">One repayment, on the 28th</strong>
                Disbursed 1st–15th → due 28th same month. Disbursed 16th–EOM → due 28th next month.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <IconInfo size={16} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-navy-600">
                <strong className="block text-navy-800">Simple daily interest</strong>
                0.8% per day to the due date, then it stops. 3-day grace; 0.1%/day penalty after
                that. No processing fee.
              </p>
            </div>
          </div>
        </div>

        {/* results */}
        <div className="flex flex-col rounded-2xl bg-navy-950 p-6 text-white">
          <p className="text-sm font-semibold text-navy-300">{t('calc.total')}</p>
          <motion.p
            key={terms.totalRepayable}
            initial={{ opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-1 text-4xl font-extrabold tracking-tight text-emerald-400"
          >
            {formatINR(terms.totalRepayable)}
          </motion.p>
          <p className="mt-1 text-xs text-navy-300">single repayment by {formatDate(terms.dueDate)}</p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <dt className="text-navy-300">{t('calc.amount')}</dt>
              <dd className="font-bold">{formatINR(amount)}</dd>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
              <dt className="text-navy-300">{t('calc.interest')}</dt>
              <dd className="font-bold">
                {formatINR(terms.interest)}{' '}
                <span className="font-normal text-navy-400">(0.8%/day × {terms.interestDays})</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-300">Interest days</dt>
              <dd className="font-bold">{terms.interestDays} days</dd>
            </div>
          </dl>

          <div className="mt-auto pt-6">
            {user ? (
              <Button to={applyHref} fullWidth>
                {t('calc.apply')}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button to={`/login?next=${encodeURIComponent(applyHref)}`} fullWidth>
                  {t('calc.apply')}
                </Button>
                <p className="text-center text-xs text-navy-300">
                  You'll log in first — we'll bring you straight back.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
