'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface VerificationContextType {
  status: VerificationStatus;
  setStatus: (status: VerificationStatus) => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VerificationStatus>('unverified');

  return (
    <VerificationContext.Provider value={{ status, setStatus }}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
} 