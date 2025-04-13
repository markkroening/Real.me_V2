'use client';

import { redirect } from 'next/navigation';
import { fallbackLng } from '@/i18n/settings';

export default function RootPage() {
  // Redirect to the default language home page
  // Middleware also handles this, but this provides a fallback
  redirect(`/${fallbackLng}`);

  // Alternatively, return null or a minimal loading indicator if needed
  // return null;
}
