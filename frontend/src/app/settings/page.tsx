'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Cancel } from '@mui/icons-material';

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load user settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings));
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify(formData));
      
      // Simulate successful update
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError(t('errors.settingsUpdateFailed'));
      console.error('Settings update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Load user settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings));
    }
    setIsEditing(false);
    setError(null);
  };

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('profile.settings')}
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('profile.settingsUpdateSuccess')}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('profile.notificationSettings')}
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(true)}
                  >
                    {t('profile.edit')}
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      type="submit"
                      disabled={loading}
                    >
                      {t('profile.save')}
                    </Button>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.emailNotifications}
                    onChange={handleChange}
                    name="emailNotifications"
                    disabled={!isEditing || loading}
                  />
                }
                label={t('profile.emailNotifications')}
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.pushNotifications}
                    onChange={handleChange}
                    name="pushNotifications"
                    disabled={!isEditing || loading}
                  />
                }
                label={t('profile.pushNotifications')}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
                <Typography variant="h6">
                  {t('profile.appearanceSettings')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.darkMode}
                    onChange={handleChange}
                    name="darkMode"
                    disabled={!isEditing || loading}
                  />
                }
                label={t('profile.darkMode')}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
                <Typography variant="h6">
                  {t('profile.languageSettings')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box>
              <TextField
                fullWidth
                select
                label={t('profile.language')}
                name="language"
                value={formData.language}
                onChange={handleChange}
                disabled={!isEditing || loading}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </TextField>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 