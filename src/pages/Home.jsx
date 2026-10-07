import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Hero from '../components/home/Hero.jsx';
import LoanTypes from '../components/home/LoanTypes.jsx';
import HowItWorks from '../components/home/HowItWorks.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import FaqSection from '../components/home/FaqSection.jsx';
import EmiCalculator from '../components/calculator/EmiCalculator.jsx';
import { SectionHeading } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { IconArrowRight } from '../components/ui/Icons.jsx';

export default function Home() {
  useDocumentTitle('Fast, transparent loans');
  return (
    <>
      <Hero />
      <LoanTypes />

      {/* EMI calculator section */}
      <section className="bg-navy-50/60 py-20 sm:py-24" aria-labelledby="home-calc-title">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="EMI Calculator"
            title="See your EMI before you apply"
            subtitle="Move the sliders. Interest, total repayment and late-fee rules are all out in the open — that's the TrustLend promise."
          />
          <div className="mt-10">
            <EmiCalculator />
          </div>
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
      <FaqSection />

      {/* closing CTA */}
      <section className="bg-navy-950 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready for money that moves at your speed?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-navy-300">
            Sign up, verify KYC in minutes, and apply for up to ₹5,00,000 at 2% monthly — with every
            charge disclosed up front.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/apply" size="lg" className="!bg-emerald-500 !text-navy-950 hover:!bg-emerald-400">
              Apply now <IconArrowRight size={18} />
            </Button>
            <Button
              to="/how-it-works"
              size="lg"
              variant="ghost"
              className="!text-white hover:!bg-white/10"
            >
              See how it works
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
