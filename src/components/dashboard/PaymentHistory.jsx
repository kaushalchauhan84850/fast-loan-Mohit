import Badge from '../ui/Badge.jsx';
import { LOAN_CONFIG } from '../../utils/interest.js';
import { formatINR, formatDateTime } from '../../utils/format.js';
import { IconCheckCircle } from '../ui/Icons.jsx';

/** Payment history: each row is a full single-cycle repayment. */
export default function PaymentHistory({ payments }) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold text-navy-700">No payments yet</p>
        <p className="mt-1 text-xs text-navy-500">
          Your repayment will appear here with a full interest and penalty split.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft">
      <h3 className="px-6 py-4 text-base font-bold text-navy-950">Payment history</h3>
      <ul className="divide-y divide-navy-50">
        {payments.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <IconCheckCircle size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-900">
                Loan repaid · {formatINR(p.amount, { decimals: true })}
              </p>
              <p className="text-xs text-navy-500">
                Principal {formatINR(p.principal)} · Interest {formatINR(p.interest)} (
                {LOAN_CONFIG.dailyInterestRate * 100}%/day)
                {p.penalty > 0 && (
                  <span className="font-semibold text-amber-700"> · Penalty {formatINR(p.penalty)}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-navy-700">{formatDateTime(p.paidAt)}</p>
              <Badge tone="neutral" className="mt-1 capitalize">
                via {p.method}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
