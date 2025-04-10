'use client';

import { Box } from '@mui/material';
import { I18nProvider } from '@/i18n/I18nProvider';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface RootLayoutClientProps {
  children: React.ReactNode;
  locale: string;
}

export const RootLayoutClient = ({ children, locale }: RootLayoutClientProps) => {
  return (
    <I18nProvider locale={locale}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Navigation />
        <Box
          component="main"
          sx={{
            flex: '1 0 auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
        <Footer />
      </Box>
    </I18nProvider>
  );
};

export default RootLayoutClient; 