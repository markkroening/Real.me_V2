import { fallbackLng, supportedLngs } from '@/i18n/settings';

/**
 * Gets the current locale from the URL pathname
 */
export function getCurrentLocale(): string {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const locale = pathname.split('/')[1];
    return supportedLngs.includes(locale as any) ? locale : fallbackLng;
  }
  return fallbackLng;
}

/**
 * Creates a localized URL with the current locale prefix
 * @param path The path without locale prefix
 * @param forceLocale Optional locale to use instead of the current one
 */
export function createLocalizedUrl(path: string, forceLocale?: string): string {
  // Remove any leading slash from the path
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Get the locale to use
  const locale = forceLocale || getCurrentLocale();
  
  return `/${locale}/${cleanPath}`;
} 