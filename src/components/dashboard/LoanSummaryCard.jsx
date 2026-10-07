import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { formatINR, formatDate } from '../../utils/format.js';
import { LOAN_CONFIG } from '../../utils/interest.js';
import { IconCalendar, IconWallet, IconTrendingUp } from '../ui/Icons.jsx';

/** Active loan overview: outstanding, EMI, next due date, progress bar. */
export default function LoanSummaryCard({ loan, schedule, nextDue, outstanding, onPayNow }) {
  const paidCount = schedule.filter((r) => r.status === 'paid').length;
  const progressPct = Math.round((paidCount / schedule.length) * 100);

  return (
    <Card className="overflow-hidden">
      <div className="bg-navy-950 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-300">Outstanding balance</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">{formatINR(outstanding)}</p>
            <p className="mt-1 text-xs text-navy-300">
              {formatINR(loan.principal)} principal · {loan.tenure} months ·{' '}
              {loan.monthlyInterestRate * 100}% monthly (reducing)
            </p>
          </div>
          <Badge status="active" className="bg-emerald-500/20 text-emerald-300" />
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-navy-300">
            <span>
              {paidCount} of {schedule.length} EMIs paid
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full bg-emerald-400"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 26 }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
            <IconWallet size={14} aria-hidden="true" /> Monthly EMI
          </p>
          <p className="mt-1 text-lg font-extrabold text-navy-950">
            {nextDue ? formatINR(nextDue.emi) : '—'}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
            <IconCalendar size={14} aria-hidden="true" /> Next due date
          </p>
          <p className="mt-1 text-lg font-extrabold text-navy-950">
            {nextDue ? formatDate(nextDue.dueDate) : 'All paid 🎉'}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
            <IconTrendingUp size={14} aria-hidden="true" /> Loan start
          </p>
          <p className="mt-1 text-lg font-extrabold text-navy-950">{formatDate(loan.startDate)}</p>
        </div>
      </div>

      <div className="border-t border-navy-100 px-6 py-4">
        {nextDue ? (
          <Button fullWidth size="lg" onClick={onPayNow}>
            Pay now · {formatINR(nextDue.emi)}
          </Button>
        ) : (
          <p className="text-center text-sm font-semibold text-emerald-700">
            Loan fully repaid — thank you!
          </p>
        )}
        <p className="mt-2 text-center text-[11px] text-navy-400">
          Grace period {LOAN_CONFIG.gracePeriodDays} days · late penalty{' '}
          {LOAN_CONFIG.dailyPenaltyRate * 100}%/day after grace
        </p>
      </div>
    </Card>
  );
}
