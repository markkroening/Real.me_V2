import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fallbackLng, supportedLngs } from './src/i18n/settings';

// List of paths to exclude from locale redirection
const PUBLIC_FILE = /\.(.*)$/;
const EXCLUDED_PATHS = ['/login', '/profile', '/settings', '/api', '/theme-test'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the path should be excluded
  if (
    EXCLUDED_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = supportedLngs.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = fallbackLng;
  const newPathname = `/${locale}${pathname}`;

  // Clone the URL to modify the pathname
  const url = request.nextUrl.clone();
  url.pathname = newPathname;

  return NextResponse.redirect(url);
}

// The config matcher is less flexible, so we handle exclusions in the middleware function
export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}; 