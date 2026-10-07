import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const SECTIONS = [
  {
    title: '1. Information we collect',
    body: [
      'Identity data: full name, date of birth, mobile number, email address.',
      'KYC data: PAN, Aadhaar (only the last 4 digits are retained in browser-facing systems; full numbers are transmitted once over TLS to our verification partner and stored in encrypted vaults), document images and a face-verification capture.',
      'Financial data: income declared by you, loan applications, repayment history and penalties.',
      'Technical data: device and browser information, app usage events, for fraud prevention and improving the service.',
    ],
  },
  {
    title: '2. How we use it',
    body: [
      'To verify your identity and meet applicable KYC obligations.',
      'To evaluate, disburse and service your loan, including calculating interest and penalties exactly as disclosed.',
      'To communicate about your application, EMIs and overdue accounts by SMS, email or call.',
      'We never sell your personal data to third parties.',
    ],
  },
  {
    title: '3. Sharing',
    body: [
      'KYC verification partners, under strict confidentiality and only for verification purposes.',
      'Payment gateways for processing your EMI payments.',
      'Regulators or law-enforcement where the law requires it.',
    ],
  },
  {
    title: '4. Storage & security',
    body: [
      'Data is encrypted in transit (TLS) and at rest (AES-256).',
      'Face captures and documents are retained only as long as legally required, then deleted.',
      'The browser never persists your full Aadhaar number, OTPs or password.',
    ],
  },
  {
    title: '5. Your rights',
    body: [
      'Request a copy of your data, or correction of inaccuracies.',
      'Withdraw consent for data usage — note that an active loan still requires servicing records.',
      'Raise grievances at grievance@trustlend.example; we respond within 7 working days.',
    ],
  },
];

export default function PrivacyPage() {
  useDocumentTitle('Privacy policy');
  return (
    <div className="py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Legal</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-navy-500">Last updated: October 2026 · Demo document</p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-navy-950">{s.title}</h2>
              <ul className="mt-3 space-y-2">
                {s.body.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-navy-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-2xl bg-navy-50 p-5 text-xs leading-relaxed text-navy-500">
          This is a demonstration document for the TrustLend frontend. Before production use, have
          it reviewed by legal counsel against applicable data-protection law (e.g. India's DPDP
          Act) and your KYC partner's requirements.
        </p>
      </div>
    </div>
  );
}
