import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { motion } from 'framer-motion';
import HowItWorks from '../components/home/HowItWorks.jsx';
import { SectionHeading } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { IconArrowRight, IconUser, IconShieldCheck, IconFileText, IconBanknote } from '../components/ui/Icons.jsx';

const DETAILS = [
  {
    icon: IconUser,
    title: '1. Sign up',
    points: [
      'Create an account with your name, mobile and email',
      'Verify your mobile with a 6-digit OTP',
      'Set a password you can log in with later',
    ],
  },
  {
    icon: IconShieldCheck,
    title: '2. Verify KYC',
    points: [
      'Upload Aadhaar and PAN (JPG, PNG or PDF)',
      'Numbers are validated instantly — Aadhaar checksum included',
      'Confirm it is really you with a selfie + liveness check',
    ],
  },
  {
    icon: IconFileText,
    title: '3. Apply',
    points: [
      'Choose amount (₹10k–₹5L) and tenure (3–36 months)',
      'See your EMI, interest and total repayment live',
      'Accept the disclosed terms and submit',
    ],
  },
  {
    icon: IconBanknote,
    title: '4. Get funds',
    points: [
      'Track approval status on your dashboard',
      'Approved loans are disbursed within 24 hours',
      'Repay by UPI, net banking or card — set reminders by SMS',
    ],
  },
];

export default function HowItWorksPage() {
  useDocumentTitle('How it works');
  return (
    <>
      <section className="bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">The process</p>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            From sign-up to funds, in four steps
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-navy-300">
            Most customers finish the whole flow in under 15 minutes.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {DETAILS.map((d, i) => (
              <motion.article
                key={d.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-soft"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-emerald-400">
                  <d.icon size={22} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-navy-950">{d.title}</h2>
                  <ul className="mt-2 space-y-1.5">
                    {d.points.map((p) => (
                      <li key={p} className="text-sm leading-relaxed text-navy-600">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="bg-white py-14 text-center">
        <Button to="/apply" size="lg">
          Start your application <IconArrowRight size={17} />
        </Button>
      </section>
    </>
  );
}
