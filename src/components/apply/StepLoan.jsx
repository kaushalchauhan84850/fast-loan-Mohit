import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { loanDetailsSchema } from '../../utils/schemas.js';
import { LOAN_CONFIG, calculateLoanTerms } from '../../utils/interest.js';
import { formatINR, formatDate } from '../../utils/format.js';
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

/**
 * Step 2 — loan amount + purpose with a live repayment preview.
 * Tenure is fixed: one billing cycle, due on the 28th (same month if
 * disbursed on the 1st–15th, next month otherwise). The preview assumes
 * disbursement today; the exact dates are confirmed at disbursal.
 */
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

  const preview = useMemo(() => {
    const terms = calculateLoanTerms({ principal: amount, disbursementDate: new Date() });
    return terms;
  }, [amount]);

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
            hint={`${formatINR(LOAN_CONFIG.minAmount)} – ${formatINR(LOAN_CONFIG.maxAmount)} · single repayment`}
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

          <Select label="Purpose of loan" required error={errors.purpose?.message} {...register('purpose')}>
            <option value="">Select purpose</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>

          <div className="rounded-xl border border-navy-100 bg-navy-50/70 p-4 text-xs leading-relaxed text-navy-600">
            <p className="font-semibold text-navy-800">How repayment works</p>
            <p className="mt-1">
              One repayment, due on the <strong>28th</strong>: disbursed between the 1st–15th → due
              the 28th of the <strong>same month</strong>; disbursed on the 16th or later → due the
              28th of the <strong>next month</strong>.
            </p>
          </div>
        </div>

        {/* live preview */}
        <aside className="flex flex-col rounded-2xl bg-navy-950 p-6 text-white" aria-live="polite">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-300">Your loan preview</h3>
          <p className="mt-1 text-xs text-navy-400">Assuming disbursement today</p>
          <motion.p
            key={preview.totalRepayable}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-4xl font-extrabold text-emerald-400"
          >
            {formatINR(preview.totalRepayable)}
          </motion.p>
          <p className="mt-1 text-sm font-semibold text-navy-300">
            repay by {formatDate(preview.dueDate)}
          </p>

          <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-navy-300">Principal</dt>
              <dd className="font-bold">{formatINR(amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-300">Interest (0.8%/day × {preview.interestDays} days)</dt>
              <dd className="font-bold">{formatINR(preview.interest)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <dt className="font-semibold text-white">Total repayment</dt>
              <dd className="text-base font-extrabold text-emerald-400">
                {formatINR(preview.totalRepayable)}
              </dd>
            </div>
          </dl>
          <p className="mt-auto flex items-start gap-2 pt-6 text-xs leading-relaxed text-navy-300">
            <IconInfo size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            If repayment is late: 3-day grace, then 0.1% per day penalty on the overdue amount until
            paid. Interest stops accruing on the due date. No processing fee. No hidden charges.
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
