import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Accordion from '../components/ui/Accordion.jsx';
import { SectionHeading } from '../components/ui/Card.jsx';
import { FAQ_ITEMS } from '../data/faq.js';

export default function FaqPage() {
  useDocumentTitle('FAQ');
  return (
    <div className="bg-navy-50/50 py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Help centre"
          title="Frequently asked questions"
          subtitle="Rates, penalties, KYC, data safety — the honest answers, in plain words."
        />
        <div className="mt-10">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </div>
    </div>
  );
}
