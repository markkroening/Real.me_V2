'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Stack,
  List,
  ListItem
} from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';

import PostItem from '@/components/PostItem';
import { useAuth } from '@/contexts/AuthContext';

// Define the structure of the API response
interface PostSummary {
  id: string;
  title: string;
  content_snippet?: string | null;
  author: { id: string; real_name: string; };
  community: { 
    id: string; 
    name: string; 
    icon_url?: string | null;
  };
  comment_count: number;
  created_at: string;
}

interface FeedApiResponse {
  items: PostSummary[];
  totalCount: number;
}

const POSTS_PER_PAGE = 20;
// Make sure API_BASE_URL is correct
const API_BASE_URL = 'http://localhost:3001/api/v1'; 

// Renamed component function to match filename convention if needed, but keeping HomePage for clarity
export default function LocaleHomePage() { 
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();

  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasMore = posts.length < totalCount;

  // Log auth state when component renders or state changes
  console.log('LocaleHomePage Render - Auth State:', { isAuthenticated, authLoading, token });

  // --- Data Fetching ---
  const fetchFeed = useCallback(async (isInitialLoad = false) => {
    console.log('fetchFeed called. Auth State:', { isAuthenticated, token, authLoading });
    if (!isAuthenticated || !token) { 
      setIsLoading(false);
      if (!authLoading) {
        setPosts([]); 
        setTotalCount(0);
      }
      console.log('fetchFeed returning early due to auth state.');
      return;
    }

    setIsLoading(true);
    setError(null);
    const currentOffset = isInitialLoad ? 0 : posts.length;

    try {
      const backendUrl = `${API_BASE_URL}/feed?limit=${POSTS_PER_PAGE}&offset=${currentOffset}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(backendUrl, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Feed fetch error! status: ${response.status}, response: ${errorText}`);
        if (response.status === 401) {
           setError(t('errors.unauthorized'));
        } else {
           setError(t('errors.generic'));
        }
        if (isInitialLoad) {
          setPosts([]);
          setTotalCount(0);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FeedApiResponse = await response.json();

      setPosts(prev => isInitialLoad ? data.items : [...prev, ...data.items]);
      setTotalCount(data.totalCount);

    } catch (err: any) {
      console.error("Failed to fetch feed:", err);
      if (!error) {
          setError(t('errors.generic'));
      }
       if (isInitialLoad) {
          setPosts([]);
          setTotalCount(0);
        }
    } finally {
      setIsLoading(false);
    }
  }, [t, token, isAuthenticated, authLoading]);

  // Effect to fetch feed when authentication state is ready
  useEffect(() => {
    console.log('AuthLoading Effect Triggered. authLoading:', authLoading);
    if (!authLoading) { 
      console.log('Auth loaded, calling fetchFeed(true)');
      fetchFeed(true); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, fetchFeed]);

  const handleExploreClick = () => {
    router.push('/communities');
  };

  // --- Render Logic --- 

  if (authLoading || (isLoading && posts.length === 0)) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && posts.length === 0) {
     return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (isAuthenticated && !isLoading && posts.length === 0 && !error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h5" component="h2">
            {t('home.noPosts')}
          </Typography>
          <Typography color="text.secondary">
            {t('home.noPostsDescription')}
          </Typography>
          <Button variant="contained" onClick={handleExploreClick}>
            {t('home.exploreCommunities')}
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!isAuthenticated && !authLoading) {
     return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h5" component="h2">
             {t('home.loginPromptTitle')} {/* Add translation */}
          </Typography>
          <Typography color="text.secondary">
            {t('home.loginPromptDescription')} {/* Add translation */}
          </Typography>
          <Button variant="contained" onClick={() => router.push('/login')}>
            {t('auth.login')}
          </Button>
           <Button variant="text" onClick={() => router.push('/signup')}>
             {t('auth.signup')} 
           </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}> 
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        {t('home.yourFeed')}
      </Typography>
      
      <InfiniteScroll
        dataLength={posts.length}
        next={() => fetchFeed(false)}
        hasMore={hasMore}
        loader={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress />
          </Box>
        }
        endMessage={
          <Typography variant="caption" color="text.secondary" align="center" component="p" sx={{ py: 2 }}>
            You've reached the end of your feed.
          </Typography>
        }
        style={{ overflow: 'visible' }}
      >
        <List disablePadding>
          {posts.map((post) => (
             <ListItem key={post.id} disablePadding sx={{ px: 0 }}>
              <PostItem 
                post={post} 
                showCommunityLink={true}
              />
             </ListItem>
          ))}
        </List>
      </InfiniteScroll>
    </Container>
  );
}
