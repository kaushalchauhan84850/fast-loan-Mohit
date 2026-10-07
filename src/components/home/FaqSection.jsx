import Accordion from '../ui/Accordion.jsx';
import { SectionHeading } from '../ui/Card.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { FAQ_ITEMS } from '../../data/faq.js';

/** FAQ block reused on the home page; the dedicated /faq page shows categories. */
export default function FaqSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-navy-50/60 py-20 sm:py-24" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title={t('section.faq.title')}
          subtitle={t('section.faq.subtitle')}
        />
        <div className="mt-10">
          <Accordion items={FAQ_ITEMS.slice(0, 6)} />
        </div>
      </div>
    </section>
  );
}
