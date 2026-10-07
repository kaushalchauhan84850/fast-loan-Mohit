import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { formatINR } from '../../utils/format.js';
import { calculateEmi } from '../../utils/interest.js';
import {
  IconStar,
  IconZap,
  IconShieldCheck,
  IconLock,
  IconArrowRight,
  IconCheck,
  IconBanknote,
  IconUser,
} from '../ui/Icons.jsx';

const TRUST_POINTS = ['trust.rating', 'trust.disbursed', 'trust.customers', 'trust.encryption'];
const TRUST_ICONS = [IconStar, IconBanknote, IconUser, IconLock];

function LoanMockCard() {
  const emi = calculateEmi(200000, 0.02, 12);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-sm"
      aria-hidden="true"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-soft-lg backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white/90">Active loan</p>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
            On track
          </span>
        </div>
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wider text-white/50">Outstanding principal</p>
          <p className="mt-1 text-3xl font-extrabold text-white">{formatINR(200000)}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-white/60">Monthly EMI</p>
            <p className="mt-0.5 text-lg font-bold text-white">{formatINR(emi)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-white/60">Interest</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-300">2%/mo</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-white/60">
            <span>EMI 2 of 12</span>
            <span>Next due in 9 days</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[16%] rounded-full bg-emerald-400" />
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-soft-lg sm:-left-10"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <IconZap size={20} />
        </span>
        <div>
          <p className="text-sm font-bold text-navy-900">₹1,50,000 disbursed</p>
          <p className="text-xs text-navy-500">in 22 hours</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -right-3 -top-5 flex items-center gap-2 rounded-2xl border border-navy-100 bg-white px-4 py-3 shadow-soft-lg sm:-right-8"
      >
        <IconShieldCheck size={18} className="text-emerald-600" />
        <p className="text-xs font-bold text-navy-900">KYC verified</p>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-navy-950">
      {/* soft gradient + glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
            {t('hero.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-5 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t('hero.title').split('transparent')[0]}
            <span className="gradient-text">transparent</span>
            {t('hero.title').includes('transparent') ? t('hero.title').split('transparent')[1] : ''}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-bold text-navy-950 shadow-glow transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              {t('hero.ctaPrimary')} <IconArrowRight size={18} />
            </Link>
            <Link
              to="/emi-calculator"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-base font-bold text-white transition-all hover:border-white/50 hover:bg-white/5"
            >
              {t('hero.ctaSecondary')}
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.34 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-navy-300"
          >
            {t('hero.note').split('·').map((part, i, arr) => (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <IconCheck size={14} className="mr-1.5 text-emerald-400" aria-hidden="true" />}
                {i === 0 && <IconCheck size={14} className="mr-1 text-emerald-400" aria-hidden="true" />}
                {part.trim()}
                {i < arr.length - 1 && <span className="sr-only">;</span>}
              </li>
            ))}
          </motion.ul>
        </div>

        <LoanMockCard />
      </div>

      {/* trust strip */}
      <div className="relative border-t border-white/10 bg-navy-950/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_POINTS.map((key, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center justify-center gap-2.5 text-center"
              >
                <Icon size={18} className="shrink-0 text-emerald-400" aria-hidden="true" />
                <span className="text-sm font-semibold text-navy-100">{t(key)}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
