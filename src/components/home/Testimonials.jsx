import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';
import { SectionHeading } from '../ui/Card.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { IconStar } from '../ui/Icons.jsx';

const TESTIMONIALS = [
  {
    name: 'Priya Nair',
    city: 'Bengaluru',
    initials: 'PN',
    quote:
      'I could see exactly what I would pay — interest, due date, even the late fee rules — before I signed. The money reached my account the next morning.',
    loan: 'Personal loan · ₹2,00,000',
  },
  {
    name: 'Rahul Mehta',
    city: 'Jaipur',
    initials: 'RM',
    quote:
      'My shop needed stock before Diwali. Applied at night, KYC took ten minutes with the selfie check, and the loan was approved by lunch.',
    loan: 'Business loan · ₹1,50,000',
  },
  {
    name: 'Sana Qureshi',
    city: 'Lucknow',
    initials: 'SQ',
    quote:
      'I was two days late on my repayment once. The dashboard showed the grace period protecting me and the exact penalty I would owe after — no shock, no hidden charge.',
    loan: 'Education loan · ₹80,000',
  },
];

export default function Testimonials() {
  const { t } = useLanguage();
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title={t('section.testimonials.title')}
          subtitle={t('section.testimonials.subtitle')}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.figure
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
            >
              <Card hover className="flex h-full flex-col p-6">
                <div className="flex gap-1 text-amber-400" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} size={15} aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-navy-700">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-navy-100 pt-4">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-950 text-sm font-bold text-emerald-400"
                    aria-hidden="true"
                  >
                    {item.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-navy-950">{item.name}</p>
                    <p className="text-xs text-navy-500">
                      {item.city} · {item.loan}
                    </p>
                  </div>
                </figcaption>
              </Card>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
