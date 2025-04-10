'use client';

import EmptyState from '@/components/EmptyState';

export default function EmptyPage() {
  const handleAction = () => {
    window.location.href = '/';
  };

  return (
    <EmptyState
      type="feed"
      actionLabel="Go to Homepage"
      onAction={handleAction}
      fullPage
    />
  );
} 