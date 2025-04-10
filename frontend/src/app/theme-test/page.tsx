'use client';

import { 
  Box, 
  Button, 
  Card, 
  Container, 
  Divider, 
  Paper, 
  Stack,
  TextField, 
  Typography, 
  useTheme 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ThemeTest() {
  const theme = useTheme();
  const { t } = useTranslation();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h1" gutterBottom>
          {t('nav.themeTest')}
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page demonstrates all aspects of the Real.me theme implementation.
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Typography Section */}
        <Typography variant="h2" gutterBottom>
          Typography
        </Typography>
        
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h1">{t('app.name')}</Typography>
          <Typography variant="h2">{t('app.tagline')}</Typography>
          <Typography variant="h3">{t('profile.edit')}</Typography>
          <Typography variant="h4">{t('community.create')}</Typography>
          <Typography variant="h5">{t('post.create')}</Typography>
          <Typography variant="h6">{t('common.loading')}</Typography>
          <Typography variant="subtitle1">{t('validation.required')}</Typography>
          <Typography variant="subtitle2">{t('validation.email')}</Typography>
          <Typography variant="body1">{t('errors.generic')}</Typography>
          <Typography variant="body2">{t('errors.networkError')}</Typography>
        </Stack>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Colors Section */}
        <Typography variant="h2" gutterBottom>
          Color Palette
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          mb: 4 
        }}>
          <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', width: 200 }}>
            <Typography variant="subtitle1">Primary</Typography>
            <Typography variant="body2">{theme.palette.primary.main}</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 200 }}>
            <Typography variant="subtitle1">Secondary</Typography>
            <Typography variant="body2">{theme.palette.secondary.main}</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'error.main', color: 'error.contrastText', width: 200 }}>
            <Typography variant="subtitle1">{t('common.error')}</Typography>
            <Typography variant="body2">{theme.palette.error.main}</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'success.contrastText', width: 200 }}>
            <Typography variant="subtitle1">{t('common.success')}</Typography>
            <Typography variant="body2">{theme.palette.success.main}</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'warning.main', color: 'warning.contrastText', width: 200 }}>
            <Typography variant="subtitle1">Warning</Typography>
            <Typography variant="body2">{theme.palette.warning.main}</Typography>
          </Paper>
          <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText', width: 200 }}>
            <Typography variant="subtitle1">Info</Typography>
            <Typography variant="body2">{theme.palette.info.main}</Typography>
          </Paper>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Buttons Section */}
        <Typography variant="h2" gutterBottom>
          {t('common.submit')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Button variant="contained" color="primary">{t('auth.login')}</Button>
          <Button variant="contained" color="secondary">{t('auth.signup')}</Button>
          <Button variant="outlined" color="primary">{t('common.cancel')}</Button>
          <Button variant="outlined" color="secondary">{t('common.edit')}</Button>
          <Button variant="text" color="primary">{t('common.learnMore')}</Button>
          <Button variant="text" color="secondary">{t('common.search')}</Button>
          <Button variant="contained" color="primary" disabled>{t('common.loading')}</Button>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Cards Section */}
        <Typography variant="h2" gutterBottom>
          Cards
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ p: 3, width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' } }}>
            <Typography variant="h5" gutterBottom>
              {t('profile.verified')}
            </Typography>
            <Typography variant="body2">
              {t('profile.bio')}
            </Typography>
          </Card>
          <Card sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' } }}>
            <Typography variant="h5" gutterBottom>
              {t('community.create')}
            </Typography>
            <Typography variant="body2">
              {t('community.description')}
            </Typography>
          </Card>
          <Card sx={{ p: 3, bgcolor: 'secondary.light', color: 'secondary.contrastText', width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' } }}>
            <Typography variant="h5" gutterBottom>
              {t('post.create')}
            </Typography>
            <Typography variant="body2">
              {t('post.content')}
            </Typography>
          </Card>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Form Elements Section */}
        <Typography variant="h2" gutterBottom>
          Form Elements
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4 
        }}>
          <TextField 
            label={t('auth.email')}
            variant="outlined" 
            helperText={t('validation.email')}
            sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}
          />
          <TextField 
            label={t('auth.password')}
            variant="outlined" 
            disabled 
            value="********"
            sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}
          />
          <TextField 
            label={t('profile.username')}
            variant="outlined" 
            error 
            helperText={t('validation.required')}
            sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}
          />
          <TextField 
            label={t('profile.fullName')}
            variant="outlined" 
            autoFocus 
            sx={{ width: { xs: '100%', md: 'calc(50% - 24px)' } }}
          />
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Responsive Layout Section */}
        <Typography variant="h2" gutterBottom>
          Responsive Layout
        </Typography>
        
        <Typography variant="body1" paragraph>
          This section demonstrates the responsive layout. Resize your browser window to see how it adapts.
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2 
        }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Paper 
              key={item} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' }
              }}
            >
              <Typography variant="h6">{t('common.loading')}</Typography>
              <Typography variant="body2">
                xs: 100%, sm: 50%, md: 33.33%
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
} 