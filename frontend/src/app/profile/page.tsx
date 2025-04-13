'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PhotoCamera, 
  Save, 
  Cancel, 
  Edit, 
  LocationOn, 
  Cake as CakeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    real_name: '',
    email: '',
    location: '',
    birth_date: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        real_name: user.real_name || '',
        email: user.email,
        location: user.location || '',
        birth_date: user.birth_date || '',
      });
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful update
      setSuccess(true);
      setIsEditing(false);
      
      // In a real app, we would update the user context here
      // For now, we'll just update the local state
      if (user) {
        const updatedUser = {
          ...user,
          real_name: formData.real_name,
          location: formData.location,
          birth_date: formData.birth_date,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError(t('errors.profileUpdateFailed'));
      console.error('Profile update failed:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        real_name: user.real_name || '',
        email: user.email,
        location: user.location || '',
        birth_date: user.birth_date || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleGetVerified = () => {
    router.push('/verification-test');
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{t('errors.userDataUnavailable')}</Alert>
      </Container>
    );
  }

  const getInitials = () => {
    if (user.real_name) {
      return user.real_name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (user.real_name) {
      return user.real_name;
    }
    return user.email;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        {/* Profile Header - Simplified Layout */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          p: 3, // Use uniform padding
          color: 'white',
          // Removed position: relative
        }}>
          {/* Use Stack for Avatar and Text layout */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{ 
                width: 80, // Adjusted size
                height: 80,
                // Removed border matching background, maybe add simple white?
                border: `2px solid white`,
                bgcolor: 'primary.dark'
              }}
            >
              {getInitials()}
            </Avatar>
            {/* Text Box (Name and Member Since) */}
            <Box> {/* Removed mb and transform */}
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {getDisplayName()}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, color: 'text.secondary' }}> 
                {t('profile.memberSince')} {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
          {/* Removed the absolutely positioned Box */}
        </Box>

        {/* Reduced CardContent padding top */}
        <CardContent sx={{ pt: 4, pb: 4 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {t('profile.updateSuccess')}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Profile Information Section */}
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {isEditing ? t('profile.editProfile') : t('profile.profileInfo')}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {user.isVerified ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Verified"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <>
                        <Chip
                          icon={<CancelIcon />}
                          label="Unverified"
                          color="default"
                          variant="outlined"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VerifiedUserIcon />}
                          onClick={handleGetVerified}
                          color="primary"
                        >
                          Get Verified
                        </Button>
                      </>
                    )}
                    {!isEditing ? (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                      >
                        {t('profile.edit')}
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                          disabled={pageLoading}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={pageLoading}
                        >
                          {pageLoading ? <CircularProgress size={24} /> : t('common.save')}
                        </Button>
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Divider sx={{ mb: 3 }} />
              </Box>

              {/* Form Fields */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {/* Basic Information */}
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <TextField
                    fullWidth
                    label={t('profile.realName')}
                    name="real_name"
                    value={formData.real_name}
                    onChange={handleChange}
                    disabled={!isEditing || pageLoading}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label={t('profile.email')}
                    name="email"
                    value={formData.email}
                    disabled={true}
                    sx={{ mb: 2 }}
                  />
                </Box>

                {/* Additional Information */}
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <TextField
                    fullWidth
                    label={t('profile.location')}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing || pageLoading}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label={t('profile.birthDate')}
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    disabled={!isEditing || pageLoading}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mb: 2 }}
                  />
                </Box>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
} 