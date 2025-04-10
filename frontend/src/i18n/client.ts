'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions, defaultNS } from './settings';

// Initialize i18next
i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => 
    import(`./locales/${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    ns: typeof getOptions().ns === 'string' 
        ? [getOptions().ns, defaultNS].filter((v, i, a) => a.indexOf(v) === i)
        : [...(getOptions().ns || []), defaultNS].filter((v, i, a) => a.indexOf(v) === i),
  });

export default i18next; 