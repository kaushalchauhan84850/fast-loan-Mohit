import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import LoanTypes from '../components/home/LoanTypes.jsx';
import EmiCalculator from '../components/calculator/EmiCalculator.jsx';
import { SectionHeading } from '../components/ui/Card.jsx';
import { LOAN_CONFIG } from '../utils/interest.js';
import { IconCheck } from '../components/ui/Icons.jsx';

const INCLUSIONS = [
  'No processing fee',
  'No prepayment penalty',
  'No hidden charges',
  '3-day grace after the due date',
  'Interest stops on the due date',
  'Due-date reminders by SMS',
];

export default function Loans() {
  useDocumentTitle('Loan products');
  return (
    <>
      <section className="bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Our products</p>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            One rate. Every loan. Full transparency.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-300">
            Whether it's a wedding, working capital or a course fee — every TrustLend loan is a
            single-cycle loan with the same honest, daily-rate terms.
          </p>
        </div>
      </section>

      <div className="-mt-10">
        <LoanTypes />
      </div>

      {/* rates table */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="rates-title">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Rates & charges"
            title="Everything you'll ever pay"
            subtitle="Printed here, shown in the calculator, confirmed before you sign. No fine print."
          />
          <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-navy-100 shadow-soft">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-navy-100">
                {[
                  ['Daily interest rate', `${LOAN_CONFIG.dailyInterestRate * 100}% per day, from disbursement to the due date`],
                  ['Loan amount', `₹10,000 – ₹5,00,000`],
                  ['Tenure', 'One billing cycle — a single repayment'],
                  ['Repayment due date', '28th of the month (same month if disbursed on the 1st–15th, next month if on the 16th or later)'],
                  ['Processing fee', '₹0'],
                  ['Grace period', `${LOAN_CONFIG.gracePeriodDays} days after the due date`],
                  ['Late payment penalty', `${LOAN_CONFIG.dailyPenaltyRate * 100}% of the overdue amount per day, until paid`],
                  ['Prepayment / foreclosure', 'Free, any time'],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row" className="px-6 py-4 text-left font-semibold text-navy-600">
                      {label}
                    </th>
                    <td className="px-6 py-4 text-right font-bold text-navy-950">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-x-8 gap-y-3">
            {INCLUSIONS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-semibold text-navy-700">
                <IconCheck size={16} className="text-emerald-600" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Try it" title="Calculate your repayment" />
          <div className="mt-10">
            <EmiCalculator />
          </div>
        </div>
      </section>
    </>
  );
}
