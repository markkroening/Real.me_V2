'use client';

import ErrorMessage from '@/components/ErrorMessage';

export default function ErrorPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <ErrorMessage
      message="The page you're looking for doesn't exist or has been moved."
      onRetry={handleRetry}
    />
  );
} 