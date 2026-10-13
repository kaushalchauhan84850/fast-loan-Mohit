import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LOAN_CONFIG } from '../../utils/interest.js';
import { formatINR, formatDate } from '../../utils/format.js';
import { IconAlertTriangle, IconInfo } from '../ui/Icons.jsx';

/**
 * Transparency panel: the exact math behind what is owed — principal, daily
 * interest to the due date, days overdue and daily penalty accrued —
 * recomputed live from the shared interest engine.
 */
export default function LateFeeBreakdown({ loan, dues }) {
  const isOverdue = dues.daysOverdue > 0;
  const inGrace = !isOverdue && dues.daysLate > 0;

  const rows = [
    ['Principal', formatINR(loan.principal, { decimals: true })],
    ['Daily interest rate', `${LOAN_CONFIG.dailyInterestRate * 100}% per day`],
    [
      'Interest days (disbursed → due)',
      `${dues.interestDays} days (${formatDate(loan.disbursementDate)} → ${formatDate(dues.dueDate)})`,
    ],
    ['Interest', formatINR(dues.interest, { decimals: true })],
    ['Total repayable on due date', formatINR(dues.totalRepayable, { decimals: true })],
    [
      'Days overdue',
      isOverdue
        ? `${dues.daysOverdue} day${dues.daysOverdue === 1 ? '' : 's'} past the ${LOAN_CONFIG.gracePeriodDays}-day grace (late ${dues.daysLate} days total)`
        : inGrace
          ? `0 — within ${dues.graceRemaining}-day grace (late ${dues.daysLate} day${dues.daysLate === 1 ? '' : 's'})`
          : '0 — on time',
    ],
    [
      `Penalty accrued (${LOAN_CONFIG.dailyPenaltyRate * 100}%/day)`,
      dues.penaltyAccrued > 0
        ? `${formatINR(dues.penaltyAccrued, { decimals: true })} · grows daily until paid`
        : '₹0',
    ],
  ];

  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-soft ${
        isOverdue ? 'border-amber-300 bg-amber-50/60' : 'border-navy-100 bg-white'
      }`}
    >
      <div className="flex items-start gap-2.5 px-6 pt-5">
        {isOverdue ? (
          <IconAlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
        ) : (
          <IconInfo size={18} className="mt-0.5 shrink-0 text-navy-400" aria-hidden="true" />
        )}
        <div>
          <h3 className="text-sm font-bold text-navy-950">
            {isOverdue
              ? 'Your loan is overdue — here is exactly what you owe'
              : 'Repayment breakdown'}
          </h3>
          <p className="mt-0.5 text-xs text-navy-500">
            Live figures from the same calculator our systems use. Nothing hidden.
          </p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-navy-100/80 px-6 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-navy-600">{label}</dt>
            <dd
              className={`text-right font-bold ${
                isOverdue && label.startsWith('Penalty') ? 'text-amber-700' : 'text-navy-900'
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <motion.div
        layout
        className="flex items-center justify-between border-t px-6 py-4"
        style={{ borderColor: isOverdue ? 'rgb(252 211 77)' : 'rgb(226 232 240)' }}
      >
        <span className={`text-sm font-bold ${isOverdue ? 'text-amber-800' : 'text-navy-800'}`}>
          Total payable now
        </span>
        <motion.span
          key={dues.totalPayable}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className={`text-xl font-extrabold ${isOverdue ? 'text-amber-800' : 'text-navy-950'}`}
        >
          {formatINR(dues.totalPayable, { decimals: true })}
        </motion.span>
      </motion.div>

      {isOverdue && (
        <p className="border-t border-amber-200 bg-amber-100/60 px-6 py-3 text-xs leading-relaxed text-amber-800">
          Interest stopped accruing on the due date. The penalty is{' '}
          {LOAN_CONFIG.dailyPenaltyRate * 100}% of the overdue amount (
          {formatINR(dues.overdueAmount)}) per day — accrued for {dues.daysOverdue} day
          {dues.daysOverdue === 1 ? '' : 's'} so far, and it stops growing the moment you repay.
        </p>
      )}
    </div>
  );
}
