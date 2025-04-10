'use client'; // Required for components using hooks like useState

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { fallbackLng } from '@/i18n/settings';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Get the current locale from the URL
      const pathname = window.location.pathname;
      const locale = pathname.split('/')[1] || fallbackLng;
      router.push(`/${locale}`);
    } catch (err) {
      setError(t('auth.loginError'));
    }
  };

  // Get the current locale for links
  const getCurrentLocale = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      return pathname.split('/')[1] || fallbackLng;
    }
    return fallbackLng;
  };

  const currentLocale = getCurrentLocale();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          {t('auth.login')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('auth.loginPrompt')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('auth.email')}
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('auth.password')}
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {t('auth.login')}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link href={`/${currentLocale}/signup`} variant="body2">
              {t('auth.noAccount')}
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 