import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import EmiCalculator from '../components/calculator/EmiCalculator.jsx';
import { SectionHeading } from '../components/ui/Card.jsx';
import { LOAN_CONFIG } from '../utils/interest.js';

/** Standalone EMI calculator page with an explainer of the math. */
export default function EmiCalculatorPage() {
  useDocumentTitle('Loan calculator');
  return (
    <div className="bg-navy-50/50 py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Loan Calculator"
          title="Plan your loan to the rupee"
          subtitle="Adjust the amount — your repayment date, interest days and total update instantly."
        />
        <div className="mt-10">
          <EmiCalculator />
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-lg font-bold text-navy-950">How we calculate your repayment</h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            Every TrustLend loan runs for <strong>one billing cycle</strong> with simple daily
            interest — the easiest kind to verify:
          </p>
          <p className="mt-4 overflow-x-auto rounded-xl bg-navy-950 px-5 py-4 font-mono text-sm text-emerald-300">
            Interest = Principal × {LOAN_CONFIG.dailyInterestRate * 100}% × Days
            <br />
            Total repayable = Principal + Interest
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-navy-600">
            <li>
              <strong>Days</strong> = from the disbursement date up to (but not including) the due
              date.
            </li>
            <li>
              <strong>Due date</strong> = the 28th: disbursed on the 1st–15th → 28th of the same
              month; disbursed on the 16th or later → 28th of the following month.
            </li>
            <li>Interest stops accruing on the due date — only penalties grow after that.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-navy-600">
            <strong>Late repayments:</strong> a {LOAN_CONFIG.gracePeriodDays}-day grace period
            follows the due date. After that, a penalty of{' '}
            {LOAN_CONFIG.dailyPenaltyRate * 100}% of the overdue amount accrues <em>per day</em>{' '}
            until it is paid — the dashboard shows the running total live.
          </p>
        </div>
      </div>
    </div>
  );
}
