'use client';

import EmptyState from '@/components/EmptyState';
import { Button } from '@mui/material';

export default function EmptyPage() {
  const handleAction = () => {
    window.location.href = '/';
  };

  return (
    <EmptyState
      title="No Content Available"
      description="There's nothing to show here right now."
      icon="explore"
      action={
        <Button variant="contained" onClick={handleAction}>
          Go to Homepage
        </Button>
      }
    />
  );
} 