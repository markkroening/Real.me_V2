'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress } from '@mui/material';
import { PersonAdd, PersonRemove } from '@mui/icons-material';

interface FollowButtonProps {
  isFollowing: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  username: string;
  disabled?: boolean;
}

export default function FollowButton({
  isFollowing,
  onFollow,
  onUnfollow,
  username,
  disabled = false,
}: FollowButtonProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow();
      } else {
        await onFollow();
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outlined" : "contained"}
      color="primary"
      startIcon={loading ? <CircularProgress size={20} /> : isFollowing ? <PersonRemove /> : <PersonAdd />}
      onClick={handleClick}
      disabled={loading || disabled}
      aria-label={isFollowing ? t('profile.unfollow', { username }) : t('profile.follow', { username })}
    >
      {isFollowing ? t('profile.following') : t('profile.follow')}
    </Button>
  );
} 