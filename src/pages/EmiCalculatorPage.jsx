import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import EmiCalculator from '../components/calculator/EmiCalculator.jsx';
import { SectionHeading } from '../components/ui/Card.jsx';
import { LOAN_CONFIG } from '../utils/interest.js';

/** Standalone EMI calculator page with an explainer of the math. */
export default function EmiCalculatorPage() {
  useDocumentTitle('EMI calculator');
  return (
    <div className="bg-navy-50/50 py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="EMI Calculator"
          title="Plan your loan to the rupee"
          subtitle="Adjust amount and tenure — EMI, interest and total repayment update instantly."
        />
        <div className="mt-10">
          <EmiCalculator />
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-lg font-bold text-navy-950">How we calculate your EMI</h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-600">
            TrustLend uses the standard <strong>reducing-balance</strong> method — the same one banks
            use. Interest is charged each month only on the outstanding balance, so your interest
            share shrinks as you repay:
          </p>
          <p className="mt-4 overflow-x-auto rounded-xl bg-navy-950 px-5 py-4 font-mono text-sm text-emerald-300">
            EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)
          </p>
          <dl className="mt-4 space-y-1.5 text-sm text-navy-600">
            <div className="flex gap-2">
              <dt className="font-semibold">P</dt>
              <dd>= loan principal</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">r</dt>
              <dd>= monthly interest rate ({LOAN_CONFIG.monthlyInterestRate * 100}% = 0.02)</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">n</dt>
              <dd>= tenure in months</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-navy-600">
            <strong>Late payments:</strong> every EMI has a {LOAN_CONFIG.gracePeriodDays}-day grace
            period. After that, a penalty of {LOAN_CONFIG.dailyPenaltyRate * 100}% of the overdue EMI
            accrues <em>per day</em> until it is paid — the dashboard shows the running total live.
          </p>
        </div>
      </div>
    </div>
  );
}
