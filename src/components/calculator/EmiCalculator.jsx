import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LOAN_CONFIG,
  calculateEmi,
  calculateTotalInterest,
} from '../../utils/interest.js';
import { formatINR } from '../../utils/format.js';
import { IconInfo } from '../ui/Icons.jsx';

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
 * Interactive EMI calculator (reused on Home and /emi-calculator).
 * Live EMI / interest / total repayment with a proportional split bar.
 */
export default function EmiCalculator({ className = '' }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(12);

  const { emi, totalInterest, totalRepayment, principalPct } = useMemo(() => {
    const e = calculateEmi(amount, LOAN_CONFIG.monthlyInterestRate, tenure);
    const ti = calculateTotalInterest(amount, LOAN_CONFIG.monthlyInterestRate, tenure);
    return {
      emi: e,
      totalInterest: ti,
      totalRepayment: Math.round((e * tenure) * 100) / 100,
      principalPct: Math.round((amount / (amount + ti)) * 100),
    };
  }, [amount, tenure]);

  const applyHref = `/apply?amount=${amount}&tenure=${tenure}`;

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
          <SliderField
            id="calc-tenure"
            label={t('calc.tenure')}
            value={tenure}
            min={LOAN_CONFIG.minTenureMonths}
            max={LOAN_CONFIG.maxTenureMonths}
            step={1}
            onChange={setTenure}
            format={(v) => `${v} mo`}
          />

          <div className="rounded-xl border border-navy-100 bg-navy-50/70 p-4">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-navy-600">
              <IconInfo size={15} className="mt-0.5 shrink-0 text-navy-500" aria-hidden="true" />
              <span>
                Interest: <strong>2% per month</strong> on reducing balance · Grace period:{' '}
                <strong>3 days</strong> after each EMI due date · Late penalty:{' '}
                <strong>0.1% per day</strong> of the overdue EMI after the grace period. No
                processing fee in this calculation.
              </span>
            </p>
          </div>
        </div>

        {/* results */}
        <div className="flex flex-col rounded-2xl bg-navy-950 p-6 text-white">
          <p className="text-sm font-semibold text-navy-300">{t('calc.emi')}</p>
          <motion.p
            key={emi}
            initial={{ opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-1 text-4xl font-extrabold tracking-tight text-emerald-400"
          >
            {formatINR(emi)}
          </motion.p>
          <p className="mt-1 text-xs text-navy-300">for {tenure} months</p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-3">
              <dt className="text-navy-300">{t('calc.interest')}</dt>
              <dd className="font-bold">{formatINR(totalInterest)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-300">{t('calc.total')}</dt>
              <dd className="font-bold">{formatINR(totalRepayment)}</dd>
            </div>
          </dl>

          {/* principal vs interest split */}
          <div className="mt-6">
            <div
              className="flex h-2.5 overflow-hidden rounded-full bg-white/10"
              role="img"
              aria-label={`Principal ${principalPct} percent, interest ${100 - principalPct} percent`}
            >
              <motion.div
                className="h-full bg-emerald-400"
                animate={{ width: `${principalPct}%` }}
                transition={{ type: 'spring', stiffness: 160, damping: 24 }}
              />
              <motion.div
                className="h-full bg-navy-400"
                animate={{ width: `${100 - principalPct}%` }}
                transition={{ type: 'spring', stiffness: 160, damping: 24 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-navy-300">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" /> Principal{' '}
                {formatINR(amount)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-navy-400" aria-hidden="true" /> Interest{' '}
                {formatINR(totalInterest)}
              </span>
            </div>
          </div>

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
