import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { IconPhone, IconMail, IconShieldCheck } from '../ui/Icons.jsx';

const PRODUCT_LINKS = [
  { to: '/loans', label: 'Loan products' },
  { to: '/emi-calculator', label: 'EMI calculator' },
  { to: '/apply', label: 'Apply for a loan' },
  { to: '/dashboard', label: 'My dashboard' },
];

const COMPANY_LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/faq', label: 'FAQ' },
  { to: '/terms', label: 'Terms of service' },
  { to: '/privacy', label: 'Privacy policy' },
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900">
                <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M10 11h12M16 11v11" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Trust<span className="text-emerald-400">Lend</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-300">{t('footer.tagline')}</p>
            <div className="mt-5 space-y-2 text-sm">
              <a href="tel:+918000000000" className="flex items-center gap-2 transition-colors hover:text-white">
                <IconPhone size={15} className="text-emerald-400" /> +91 80000 00000
              </a>
              <a href="mailto:support@trustlend.example" className="flex items-center gap-2 transition-colors hover:text-white">
                <IconMail size={15} className="text-emerald-400" /> support@trustlend.example
              </a>
            </div>
          </div>

          <nav aria-label="Products">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Products</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-emerald-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {COMPANY_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-emerald-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Lender information</h3>
            <div className="mt-4 rounded-xl border border-navy-800 bg-navy-900/60 p-4 text-xs leading-relaxed text-navy-300">
              <p className="flex items-center gap-1.5 font-semibold text-navy-100">
                <IconShieldCheck size={14} className="text-emerald-400" /> Registered private lender
              </p>
              <p className="mt-2">
                TrustLend (Proprietorship), Registered Office: 12 Finance Street, Mumbai 400001.
                Lender Registration No. <strong className="text-navy-100">TL-REG-2024-00987</strong>.
              </p>
              <p className="mt-2">
                Loans are provided at the lender's sole discretion. Interest is charged monthly on the
                reducing balance; late payments attract a daily penalty after the grace period, as
                disclosed before you apply.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-navy-800 pt-6">
          <p className="text-xs leading-relaxed text-navy-400">
            <strong className="text-navy-200">Disclaimer:</strong> TrustLend is a private lender and
            is not a bank or NBFC unless stated otherwise. Registration/licence details above are
            illustrative placeholders for this demo and must be replaced with the lender's actual
            registration information before production use. All interest rates, penalties and total
            repayment amounts are shown transparently before application. Credit at the sole
            discretion of the lender. Missing payments may affect your creditworthiness with us and
            incur daily penalty interest.
          </p>
          <p className="mt-4 text-center text-xs text-navy-400">
            © {new Date().getFullYear()} TrustLend. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
