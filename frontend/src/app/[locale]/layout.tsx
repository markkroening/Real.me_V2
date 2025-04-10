'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { I18nProvider } from "@/i18n/I18nProvider";

const inter = Inter({ subsets: ["latin"] });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  return (
    <I18nProvider locale={locale}>
      {children}
    </I18nProvider>
  );
} 