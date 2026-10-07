import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/Card.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { IconUser, IconShieldCheck, IconFileText, IconBanknote } from '../ui/Icons.jsx';

const STEP_ICONS = [IconUser, IconShieldCheck, IconFileText, IconBanknote];
const STEP_KEYS = [1, 2, 3, 4];

export default function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section className="bg-navy-50/60 py-20 sm:py-24" aria-labelledby="how-it-works-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="how-it-works-title" className="sr-only">
          {t('section.how.title')}
        </h2>
        <SectionHeading eyebrow="Process" title={t('section.how.title')} subtitle={t('section.how.subtitle')} />

        <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* connector line (desktop) */}
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-7 hidden h-0.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/40 to-emerald-500/10 lg:block"
            aria-hidden="true"
          />
          {STEP_KEYS.map((n, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <motion.li
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-950 text-emerald-400 shadow-soft">
                  <Icon size={24} />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-extrabold text-white">
                    {n}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-navy-950">{t(`step.${n}`)}</h3>
                <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-navy-600">
                  {t(`step.${n}.desc`)}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
