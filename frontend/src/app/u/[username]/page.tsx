'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon,
  CalendarToday as CalendarIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';

import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { usePost } from '@/contexts/PostContext';
import PostItem from '@/components/PostItem';
import VerificationBadge from '@/components/VerificationBadge';
import FollowButton from '@/components/FollowButton';
import { PostCard } from '@/components/PostCard';
import { UserProfile, Post } from '@/types';

export default function UserProfilePage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const { user: currentUser, isAuthenticated } = useAuth();
  const { fetchProfile, followUser, unfollowUser, isLoading: profileLoading, error: profileError } = useProfile();
  const { fetchUserPosts, posts, isLoading: postsLoading, error: postsError } = usePost();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const isOwnProfile = currentUser?.username === username;
  
  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const profileData = await fetchProfile(username);
        
        if (!profileData) {
          setError(t('profile.notFound'));
          setIsLoading(false);
          return;
        }
        
        setProfile(profileData);
        
        // Fetch user posts
        await fetchUserPosts(username);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(t('profile.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (username) {
      loadProfileData();
    }
  }, [username, fetchProfile, fetchUserPosts, t]);
  
  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    try {
      if (isFollowing) {
        await unfollowUser(username);
      } else {
        await followUser(username);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
      setError(t('profile.followError'));
    }
  };
  
  if (isLoading || profileLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error || profileError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || profileError}
        </Alert>
      </Container>
    );
  }
  
  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {t('profile.notFound')}
        </Alert>
      </Container>
    );
  }
  
  // Format the join date
  const joinDate = format(new Date(profile.createdAt), 'MMMM yyyy');
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={profile.avatar || undefined}
                alt={profile.username}
                sx={{ width: 120, height: 120, fontSize: '3rem' }}
              >
                {profile.firstName.charAt(0)}
              </Avatar>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Typography variant="h4" component="h1">
                {profile.firstName} {profile.lastName}
              </Typography>
              <VerificationBadge isVerified={profile.isVerified} />
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              @{profile.username}
            </Typography>
            
            {profile.bio && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.bio}
              </Typography>
            )}
            
            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              {profile.location && (
                <Chip
                  icon={<LocationIcon />}
                  label={profile.location}
                  size="small"
                  variant="outlined"
                />
              )}
              
              {profile.age && (
                <Chip
                  icon={<CakeIcon />}
                  label={`${profile.age} ${t('profile.yearsOld')}`}
                  size="small"
                  variant="outlined"
                />
              )}
              
              <Chip
                icon={<CalendarIcon />}
                label={`${t('profile.joined')} ${joinDate}`}
                size="small"
                variant="outlined"
              />
            </Stack>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {isOwnProfile ? (
                <>
                  <Button
                    component={Link}
                    href="/profile/edit"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    aria-label={t('profile.editFor', { name: `${profile.firstName} ${profile.lastName}` })}
                  >
                    {t('profile.edit')}
                  </Button>
                  
                  {!profile.isVerified && (
                    <Button
                      component={Link}
                      href="/verify"
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      aria-label={t('profile.verifyNow')}
                    >
                      {t('profile.verifyNow')}
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant={isFollowing ? 'outlined' : 'contained'}
                  startIcon={isFollowing ? <RemoveIcon /> : <AddIcon />}
                  onClick={handleFollow}
                  disabled={!isAuthenticated}
                >
                  {isFollowing ? t('profile.unfollow') : t('profile.follow')}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="h5" component="h2" gutterBottom>
        {isOwnProfile ? t('profile.myPosts') : t('profile.userPosts', { name: profile.firstName })}
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {postsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : postsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {postsError}
        </Alert>
      ) : posts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {isOwnProfile 
              ? t('profile.noPostsSelf') 
              : t('profile.noPostsOther', { name: profile.firstName })}
          </Typography>
          
          {isOwnProfile && (
            <Button
              component={Link}
              href="/c/create"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              {t('post.create')}
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <PostCard post={post} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 