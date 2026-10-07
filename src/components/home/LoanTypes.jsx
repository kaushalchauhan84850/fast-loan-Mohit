import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import { SectionHeading } from '../ui/Card.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { IconUser, IconBriefcase, IconBookOpen, IconHome, IconArrowRight } from '../ui/Icons.jsx';
import { formatINR } from '../../utils/format.js';

const LOAN_TYPES = [
  {
    icon: IconUser,
    name: 'Personal loan',
    range: [10000, 500000],
    tenure: '3–36 months',
    desc: 'Weddings, travel, medical bills or consolidating expensive debt — one flat rate, no surprises.',
  },
  {
    icon: IconBriefcase,
    name: 'Business loan',
    range: [50000, 500000],
    tenure: '3–24 months',
    desc: 'Working capital, inventory or equipment. Quick decisions so you never miss an opportunity.',
  },
  {
    icon: IconBookOpen,
    name: 'Education loan',
    range: [20000, 300000],
    tenure: '6–36 months',
    desc: 'Course fees, laptops or living costs. Flexible EMIs that start after a simple approval.',
  },
  {
    icon: IconHome,
    name: 'Home renovation',
    range: [30000, 500000],
    tenure: '6–36 months',
    desc: 'Repairs, upgrades or a fresh coat of paint. Funds in your bank within 24 hours of approval.',
  },
];

export default function LoanTypes() {
  const { t } = useLanguage();
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="loan-types-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Products"
          title={t('section.loans.title')}
          subtitle={t('section.loans.subtitle')}
        />
        <div id="loan-types-title" className="sr-only">
          {t('section.loans.title')}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LOAN_TYPES.map((loan, i) => (
            <motion.div
              key={loan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <Card hover className="flex h-full flex-col p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-emerald-400">
                  <loan.icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-navy-950">{loan.name}</h3>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {formatINR(loan.range[0])} – {formatINR(loan.range[1])}
                </p>
                <p className="mt-1 text-xs font-medium text-navy-500">Tenure: {loan.tenure}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600">{loan.desc}</p>
                <Link
                  to="/apply"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition-colors hover:text-emerald-600"
                >
                  Apply <IconArrowRight size={15} />
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-navy-500">
          All loans: <strong className="text-navy-800">2% per month</strong> (reducing balance) ·{' '}
          <strong className="text-navy-800">3-day grace</strong> on EMI due dates ·{' '}
          <strong className="text-navy-800">0.1% per day</strong> penalty on overdue EMIs after grace.
        </p>
      </div>
    </section>
  );
}
