import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { formatINR, formatDate } from '../../utils/format.js';
import { LOAN_CONFIG } from '../../utils/interest.js';
import { IconCalendar, IconWallet, IconClock } from '../ui/Icons.jsx';

/**
 * Active loan overview for a single-cycle loan: total repayable, due date,
 * days left/overdue, and Pay now. `dues` comes from the shared engine.
 */
export default function LoanSummaryCard({ loan, dues, onPayNow }) {
  const isOverdue = dues.daysOverdue > 0;
  const isDueSoon = !isOverdue && dues.graceRemaining === 0 && dues.daysLate === 0;
  const daysLeft = -dues.daysLate;

  return (
    <Card className="overflow-hidden">
      <div className="bg-navy-950 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-300">
              Amount to repay
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatINR(dues.totalPayable, { decimals: dues.penaltyAccrued > 0 })}
            </p>
            <p className="mt-1 text-xs text-navy-300">
              {formatINR(loan.principal)} principal + {formatINR(dues.interest)} interest
              {dues.penaltyAccrued > 0 && (
                <span className="font-semibold text-amber-300">
                  {' '}
                  + {formatINR(dues.penaltyAccrued)} penalty
                </span>
              )}
            </p>
          </div>
          <Badge status={isOverdue ? 'overdue' : 'active'} className="bg-emerald-500/20 text-emerald-300" />
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-navy-300">
            <span>
              {isOverdue
                ? `Overdue by ${dues.daysLate} day${dues.daysLate === 1 ? '' : 's'}`
                : isDueSoon
                  ? 'Due today'
                  : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
            </span>
            <span>{dues.interestDays}-day interest window</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className={`h-full rounded-full ${isOverdue ? 'bg-amber-400' : 'bg-emerald-400'}`}
              initial={false}
              animate={{ width: isOverdue ? '100%' : `${Math.max(4, Math.round((1 - daysLeft / dues.interestDays) * 100))}%` }}
              transition={{ type: 'spring', stiffness: 160, damping: 26 }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
            <IconCalendar size={14} aria-hidden="true" /> Repay by
          </p>
          <p className="mt-1 text-lg font-extrabold text-navy-950">{formatDate(dues.dueDate)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
            <IconWallet size={14} aria-hidden="true" /> Principal
          </p>
          <p className="mt-1 text-lg font-extrabold text-navy-950">{formatINR(loan.principal)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-500">
            <IconClock size={14} aria-hidden="true" /> Disbursed
          </p>
          <p className="mt-1 text-lg font-extrabold text-navy-950">
            {formatDate(loan.disbursementDate)}
          </p>
        </div>
      </div>

      <div className="border-t border-navy-100 px-6 py-4">
        <Button fullWidth size="lg" onClick={onPayNow}>
          Pay now · {formatINR(dues.totalPayable)}
        </Button>
        <p className="mt-2 text-center text-[11px] text-navy-400">
          Grace period {LOAN_CONFIG.gracePeriodDays} days · late penalty{' '}
          {LOAN_CONFIG.dailyPenaltyRate * 100}%/day on the overdue amount after grace
        </p>
      </div>
    </Card>
  );
}
