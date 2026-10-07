import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { loanDetailsSchema } from '../../utils/schemas.js';
import { LOAN_CONFIG, calculateEmi, calculateTotalInterest } from '../../utils/interest.js';
import { formatINR } from '../../utils/format.js';
import { Input, Select } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { IconInfo } from '../ui/Icons.jsx';

const PURPOSES = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'home-renovation', label: 'Home renovation' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

/** Step 2 — amount & tenure with live EMI/interest preview (compliance disclosure). */
export default function StepLoan({ defaultValues, onNext, onBack }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loanDetailsSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const amount = Number(watch('amount')) || 0;
  const tenure = Number(watch('tenure')) || 12;

  const preview = useMemo(() => {
    const emi = calculateEmi(amount, LOAN_CONFIG.monthlyInterestRate, tenure);
    const totalInterest = calculateTotalInterest(amount, LOAN_CONFIG.monthlyInterestRate, tenure);
    return { emi, totalInterest, total: Math.round(emi * tenure * 100) / 100 };
  }, [amount, tenure]);

  return (
    <form noValidate onSubmit={handleSubmit((data) => onNext(data))} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <Input
            label="Loan amount (₹)"
            required
            type="number"
            min={LOAN_CONFIG.minAmount}
            max={LOAN_CONFIG.maxAmount}
            step={1000}
            error={errors.amount?.message}
            hint={`${formatINR(LOAN_CONFIG.minAmount)} – ${formatINR(LOAN_CONFIG.maxAmount)}`}
            {...register('amount')}
          />
          <div>
            <div className="mb-1.5 flex justify-between">
              <span className="text-sm font-medium text-navy-800">Quick adjust</span>
              <span className="text-xs text-navy-500">drag to change amount</span>
            </div>
            <input
              type="range"
              aria-label="Adjust loan amount"
              min={LOAN_CONFIG.minAmount}
              max={LOAN_CONFIG.maxAmount}
              step={5000}
              value={Math.min(Math.max(amount, LOAN_CONFIG.minAmount), LOAN_CONFIG.maxAmount)}
              onChange={(e) => setValue('amount', Number(e.target.value), { shouldValidate: true })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-navy-100 accent-emerald-600"
            />
          </div>

          <Input
            label="Tenure (months)"
            required
            type="number"
            min={LOAN_CONFIG.minTenureMonths}
            max={LOAN_CONFIG.maxTenureMonths}
            error={errors.tenure?.message}
            hint={`${LOAN_CONFIG.minTenureMonths}–${LOAN_CONFIG.maxTenureMonths} months`}
            {...register('tenure')}
          />
          <Select label="Purpose of loan" required error={errors.purpose?.message} {...register('purpose')}>
            <option value="">Select purpose</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        {/* live preview */}
        <aside className="flex flex-col rounded-2xl bg-navy-950 p-6 text-white" aria-live="polite">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-300">Your loan preview</h3>
          <motion.p
            key={preview.emi}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-4xl font-extrabold text-emerald-400"
          >
            {formatINR(preview.emi)}
            <span className="ml-2 text-sm font-semibold text-navy-300">/month</span>
          </motion.p>
          <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-navy-300">Principal</dt>
              <dd className="font-bold">{formatINR(amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-300">Interest (2%/mo reducing)</dt>
              <dd className="font-bold">{formatINR(preview.totalInterest)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <dt className="font-semibold text-white">Total repayment</dt>
              <dd className="text-base font-extrabold text-emerald-400">{formatINR(preview.total)}</dd>
            </div>
          </dl>
          <p className="mt-auto flex items-start gap-2 pt-6 text-xs leading-relaxed text-navy-300">
            <IconInfo size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            If an EMI is late: 3-day grace, then 0.1% per day penalty on the overdue EMI until paid.
            No processing fee. No hidden charges.
          </p>
        </aside>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg">
          Save & continue
        </Button>
      </div>
    </form>
  );
}
