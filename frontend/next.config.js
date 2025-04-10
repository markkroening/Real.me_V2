/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove i18n configuration as it's not compatible with the App Router
  // i18n: {
  //   locales: ['en', 'fr', 'es'],
  //   defaultLocale: 'en',
  //   localeDetection: true,
  // },
  // Remove experimental features as they're no longer needed in Next.js 13+
  // experimental: {
  //   appDir: true,
  // },
};

module.exports = nextConfig; 