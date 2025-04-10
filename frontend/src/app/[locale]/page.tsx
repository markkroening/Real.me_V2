'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('home.welcome')}
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            {t('home.welcomeMessage')}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="/signup"
            >
              {t('auth.signup')}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              href="/login"
            >
              {t('auth.login')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('home.yourFeed')}
      </Typography>
      <EmptyState
        title={t('home.noPosts')}
        description={t('home.noPostsDescription')}
        action={
          <Button
            variant="contained"
            color="primary"
            href="/communities"
          >
            {t('home.exploreCommunities')}
          </Button>
        }
      />
    </Container>
  );
}
