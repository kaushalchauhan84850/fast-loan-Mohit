import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { LOAN_CONFIG } from '../utils/interest.js';

export default function TermsPage() {
  useDocumentTitle('Terms of service');
  const rate = (LOAN_CONFIG.dailyInterestRate * 100).toFixed(1);
  const penalty = (LOAN_CONFIG.dailyPenaltyRate * 100).toFixed(1);
  return (
    <div className="py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Legal</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-navy-500">Last updated: October 2026 · Demo document</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-navy-600">
          <section>
            <h2 className="text-lg font-bold text-navy-950">1. The agreement</h2>
            <p className="mt-2">
              These terms govern your use of the TrustLend platform and any loan extended by the
              lender (a registered private lender; registration details in the website footer).
              By applying for a loan you accept these terms and the rates disclosed to you before
              submission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy-950">2. Interest and repayment</h2>
            <p className="mt-2">
              Loans carry simple interest of <strong>{rate}% per day</strong> on the principal, from
              the disbursement date up to the repayment due date. Every loan is a single-cycle loan:
              one repayment of Principal + Interest, due on the <strong>28th</strong> of the month
              (same month if disbursed between the 1st and 15th, the following month if disbursed on
              the 16th or later). You may prepay any amount at any time without charge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy-950">3. Late payment and penalty</h2>
            <p className="mt-2">
              Interest stops accruing on the due date. Each repayment has a{' '}
              <strong>{LOAN_CONFIG.gracePeriodDays}-day grace period</strong> after its due date. If
              the amount remains unpaid after the grace period, a penalty of{' '}
              <strong>{penalty}% of the overdue amount per day</strong> accrues daily until it is
              paid in full. The dashboard discloses the running penalty at all times.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy-950">4. KYC and consent</h2>
            <p className="mt-2">
              Approval requires identity verification through Aadhaar, PAN and face verification as
              disclosed at application. You authorise the lender and its verification partners to
              process these documents for KYC purposes. Consent is recorded with your application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy-950">5. Responsible borrowing</h2>
            <p className="mt-2">
              Borrow only what you can repay. Missing payments increases the cost of your loan
              through penalties and may affect future borrowing with us. If you foresee difficulty
              paying, contact support <em>before</em> the due date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-navy-950">6. Changes</h2>
            <p className="mt-2">
              We may update these terms; material changes will be notified before they take effect.
              The rates applicable to an already-disbursed loan never change.
            </p>
          </section>
        </div>

        <p className="mt-12 rounded-2xl bg-navy-50 p-5 text-xs leading-relaxed text-navy-500">
          Demonstration document — replace with legally-reviewed terms, and verify lending
          registration/licence display requirements for your jurisdiction before production.
        </p>
      </div>
    </div>
  );
}
