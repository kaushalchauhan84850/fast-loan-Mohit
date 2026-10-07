import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { translations } from './translations.js';
import { storageGet, storageSet } from '../utils/storage.js';

const LANG_KEY = 'tl_lang';
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = storageGet(LANG_KEY);
    return stored === 'hi' || stored === 'en' ? stored : 'en';
  });

  useEffect(() => {
    storageSet(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
