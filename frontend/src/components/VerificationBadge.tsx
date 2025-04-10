'use client';

import { useTranslation } from 'react-i18next';
import { Chip, Tooltip } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'small' | 'medium';
}

export default function VerificationBadge({ isVerified, size = 'medium' }: VerificationBadgeProps) {
  const { t } = useTranslation();

  if (!isVerified) {
    return null;
  }

  return (
    <Tooltip title={t('profile.verified')} arrow>
      <Chip
        icon={<VerifiedIcon />}
        label={t('profile.verified')}
        color="primary"
        size={size}
        sx={{ 
          fontWeight: 'medium',
          '& .MuiChip-icon': {
            color: 'primary.main',
          }
        }}
      />
    </Tooltip>
  );
} 