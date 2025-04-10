'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useVerification } from '@/contexts/VerificationContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';

export default function VerificationStatusPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useVerification();

  useEffect(() => {
    if (status === 'unverified') {
      router.push('/verify');
    }
  }, [status, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />;
      case 'rejected':
        return <ErrorIcon color="error" sx={{ fontSize: 64 }} />;
      case 'pending':
        return <PendingIcon color="primary" sx={{ fontSize: 64 }} />;
      default:
        return <CircularProgress size={64} />;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>{getStatusIcon()}</Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {t(`verification.status.${status}`)}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {status === 'pending'
            ? t('verification.pendingMessage')
            : status === 'rejected'
            ? t('verification.rejectedMessage')
            : t('verification.verifiedMessage')}
        </Typography>
        {status === 'rejected' && (
          <Button
            variant="contained"
            onClick={() => router.push('/verify')}
            sx={{ mt: 2 }}
          >
            {t('verification.tryAgain')}
          </Button>
        )}
        <Button
          color="inherit"
          onClick={() => router.push('/')}
          sx={{ mt: 2, ml: status === 'rejected' ? 2 : 0 }}
        >
          {t('common.backToHome')}
        </Button>
      </Paper>
    </Container>
  );
} 