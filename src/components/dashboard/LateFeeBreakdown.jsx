import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateDues, LOAN_CONFIG } from '../../utils/interest.js';
import { formatINR, formatDate } from '../../utils/format.js';
import { IconAlertTriangle, IconInfo } from '../ui/Icons.jsx';

/**
 * Late-fee transparency panel: the exact money math behind the next EMI —
 * principal part, monthly interest, days overdue, daily penalty accrued —
 * recomputed live from the shared interest engine.
 */
export default function LateFeeBreakdown({ loan, nextDue }) {
  const dues = useMemo(
    () =>
      calculateDues({
        principal: nextDue.balanceBefore,
        monthlyInterestRate: loan.monthlyInterestRate,
        dueDate: nextDue.dueDate,
        principalDue: nextDue.principal,
        overdueAmount: nextDue.emi,
      }),
    [loan, nextDue]
  );

  const isOverdue = dues.daysOverdue > 0;
  const inGrace = !isOverdue && dues.daysLate > 0;

  const rows = [
    ['Principal due this EMI', formatINR(dues.principalDue, { decimals: true })],
    ['Monthly interest (2% of outstanding)', formatINR(dues.interestDue, { decimals: true })],
    ['Due date', formatDate(nextDue.dueDate)],
    [
      'Days overdue',
      isOverdue
        ? `${dues.daysOverdue} day${dues.daysOverdue === 1 ? '' : 's'} (grace of ${LOAN_CONFIG.gracePeriodDays} days used)`
        : inGrace
          ? `0 — within ${dues.graceRemaining}-day grace`
          : '0 — on time',
    ],
    [
      'Penalty accrued (0.1%/day)',
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
              ? `EMI ${nextDue.no} is overdue — here's exactly what you owe`
              : `EMI ${nextDue.no} breakdown`}
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
            <dd className={`text-right font-bold ${isOverdue && label === 'Penalty accrued (0.1%/day)' ? 'text-amber-700' : 'text-navy-900'}`}>
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
          Penalty is 0.1% of the overdue EMI ({formatINR(dues.overdueAmount)}) per day. It has
          accrued for {dues.daysOverdue} day{dues.daysOverdue === 1 ? '' : 's'} so far and stops
          growing the moment this EMI is paid.
        </p>
      )}
    </div>
  );
}
