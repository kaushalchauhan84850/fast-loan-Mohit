import { useLanguage } from '../../context/LanguageContext.jsx';
import { IconPhone, IconMail, IconClock, IconGlobe } from '../ui/Icons.jsx';

/** Slim info strip above the navbar: contact, support hours, language. */
export default function TopBar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="bg-navy-950 text-navy-100">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <a
            href="tel:+918000000000"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <IconPhone size={13} />
            <span className="hidden xs:inline sm:inline">+91 80000 00000</span>
            <span className="sm:hidden">Call us</span>
          </a>
          <a
            href="mailto:support@trustlend.example"
            className="hidden items-center gap-1.5 transition-colors hover:text-white md:flex"
          >
            <IconMail size={13} />
            support@trustlend.example
          </a>
          <span className="hidden items-center gap-1.5 lg:flex">
            <IconClock size={13} />
            {t('top.hours')}
          </span>
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Language selector">
          <IconGlobe size={13} className="text-navy-300" aria-hidden="true" />
          <div className="flex overflow-hidden rounded-full border border-navy-700">
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-2.5 py-0.5 font-semibold transition-colors ${
                lang === 'en' ? 'bg-emerald-500 text-white' : 'text-navy-200 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              aria-pressed={lang === 'hi'}
              className={`px-2.5 py-0.5 font-semibold transition-colors ${
                lang === 'hi' ? 'bg-emerald-500 text-white' : 'text-navy-200 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
