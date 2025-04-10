'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useTranslation();

  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
      <Typography variant="h6" component="h2" gutterBottom>
        {t('errors.generic')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {message || t('errors.default')}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          sx={{ mt: 1 }}
        >
          {t('common.retry')}
        </Button>
      )}
    </Paper>
  );
} 