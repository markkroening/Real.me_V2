export const defaultNS = 'common';

export const fallbackLng = 'en';

export const supportedLngs = ['en', 'fr', 'es'] as const;

export type SupportedLanguage = (typeof supportedLngs)[number];

export const defaultNSBundle = {
  en: () => import('./locales/en/common.json'),
  fr: () => import('./locales/fr/common.json'),
  es: () => import('./locales/es/common.json'),
} as const;

// Function to get the language name in its native form
export const getLanguageNativeName = (lng: SupportedLanguage): string => {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
  };
  return names[lng];
};

// Detect if the language is RTL
export const isRTL = (lng: string): boolean => {
  const rtlLanguages = new Set(['ar', 'he', 'fa']); // Add more RTL languages as needed
  return rtlLanguages.has(lng);
};

// Get i18next options
export const getOptions = (lng = fallbackLng, ns = defaultNS) => {
  return {
    supportedLngs,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    debug: process.env.NODE_ENV === 'development',
  };
}; 