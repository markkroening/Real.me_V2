import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { fallbackLng } from "@/i18n/settings";
import { Providers } from "./providers";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Real.me",
  description: "Real People, Real Communities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={fallbackLng}>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
