'use client';

import { useTranslation } from 'react-i18next';
import { Badge, IconButton, Tooltip } from '@mui/material';
import {
  VerifiedUser,
  PendingActions,
  Error,
  Person,
} from '@mui/icons-material';
import { useVerification } from '@/contexts/VerificationContext';

export default function VerificationStatus() {
  const { t } = useTranslation();
  const { status } = useVerification();

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <VerifiedUser color="success" />;
      case 'pending':
        return <PendingActions color="warning" />;
      case 'rejected':
        return <Error color="error" />;
      default:
        return <Person color="action" />;
    }
  };

  const getStatusTooltip = () => {
    switch (status) {
      case 'verified':
        return t('verification.status.verified');
      case 'pending':
        return t('verification.status.pending');
      case 'rejected':
        return t('verification.status.rejected');
      default:
        return t('verification.status.unverified');
    }
  };

  return (
    <Tooltip title={getStatusTooltip()}>
      <IconButton color="inherit" size="small">
        <Badge
          color={
            status === 'verified'
              ? 'success'
              : status === 'pending'
              ? 'warning'
              : status === 'rejected'
              ? 'error'
              : 'default'
          }
          variant="dot"
        >
          {getStatusIcon()}
        </Badge>
      </IconButton>
    </Tooltip>
  );
} 