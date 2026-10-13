import Badge from '../ui/Badge.jsx';
import { LOAN_CONFIG } from '../../utils/interest.js';
import { formatINR, formatDate } from '../../utils/format.js';
import { IconCheckCircle } from '../ui/Icons.jsx';

/**
 * Repayment summary for a single-cycle loan (replaces the old multi-EMI
 * schedule): key dates and amounts in one clean card.
 */
export default function RepaymentSummary({ loan, dues }) {
  const isOverdue = dues.daysOverdue > 0;

  const rows = [
    ['Disbursed on', formatDate(loan.disbursementDate)],
    ['Due date (28th rule)', formatDate(dues.dueDate)],
    ['Interest window', `${dues.interestDays} days × ${LOAN_CONFIG.dailyInterestRate * 100}%/day`],
    ['Principal', formatINR(loan.principal, { decimals: true })],
    ['Interest', formatINR(dues.interest, { decimals: true })],
    ['Repayable on due date', formatINR(dues.totalRepayable, { decimals: true })],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft">
      <div className="flex items-center justify-between px-6 py-4">
        <h3 className="text-base font-bold text-navy-950">Repayment summary</h3>
        <Badge status={isOverdue ? 'overdue' : 'due'} />
      </div>

      <dl className="divide-y divide-navy-50">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
            <dt className="text-navy-600">{label}</dt>
            <dd className="text-right font-bold text-navy-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-start gap-2 border-t border-navy-100 bg-navy-50/50 px-6 py-4 text-xs leading-relaxed text-navy-500">
        <IconCheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
        <p>
          Single-cycle loan: one repayment, no EMIs. Loans disbursed on the 1st–15th are due on the
          28th of the same month; disbursed on the 16th or later, on the 28th of the following
          month. Prepay any day at no extra charge.
        </p>
      </div>
    </div>
  );
}
