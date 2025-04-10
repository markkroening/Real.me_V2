'use client';

import { createInstance } from 'i18next';
import { PropsWithChildren, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { defaultNS, defaultNSBundle, fallbackLng, supportedLngs } from './settings';
import { usePathname, useRouter } from 'next/navigation';

// Create a new i18next instance
const i18nInstance = createInstance({
  fallbackLng,
  defaultNS,
  supportedLngs,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Initialize i18next with the resources backend
i18nInstance.use(
  resourcesToBackend(async (language: string, namespace: string) => {
    if (namespace === defaultNS) {
      const bundle = defaultNSBundle[language as keyof typeof defaultNSBundle];
      if (bundle) {
        const module = await bundle();
        return module.default;
      }
    }
    return {};
  })
);

// Initialize i18next
i18nInstance.init();

export function I18nProvider({ children, locale = fallbackLng }: PropsWithChildren<{ locale?: string }>) {
  const [instance] = useState(i18nInstance);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set the language
    instance.changeLanguage(locale);
  }, [locale, instance]);

  // Handle RTL
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nextProvider i18n={instance}>
      {children}
    </I18nextProvider>
  );
} 