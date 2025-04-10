'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import '../i18n/client';
import { ThemeProvider } from '@/components/ThemeProvider';
import { VerificationProvider } from '@/contexts/VerificationContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { PostProvider } from '@/contexts/PostContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VerificationProvider>
          <ProfileProvider>
            <PostProvider>
              {children}
            </PostProvider>
          </ProfileProvider>
        </VerificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 