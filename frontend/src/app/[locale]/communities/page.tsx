'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  TextField,
  InputAdornment,
  Grid, 
  List, 
  ListItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InfiniteScroll from 'react-infinite-scroll-component';
import CommunityCard from '@/components/CommunityCard'; // Verify path
import { useAuth } from '@/contexts/AuthContext';
import { useVerification } from '@/contexts/VerificationContext'; // Verify path

// Define Community and Post interfaces (ensure these match CommunityCard expectations)
interface Post {
  id: string;
  content: string;
  created_at: string;
}

export interface Community { // Export if used by CommunityCard directly
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
  recentPosts: Post[];
  is_member?: boolean; // Add this if backend includes it
}

interface ApiResponse {
  items: Community[];
  totalCount: number;
}

const COMMUNITIES_PER_PAGE = 10;
const API_BASE_URL = 'http://localhost:3001/api/v1'; 

export default function CommunitiesPage() {
  console.log('>>> CommunitiesPage Component Render Start'); // <<< ADD THIS LINE MANUALLY
  const { t } = useTranslation();
  const router = useRouter(); 
  const { isAuthenticated, user, token } = useAuth(); 
  const { status: verificationStatus } = useVerification(); 
  const isVerified = verificationStatus === 'verified';

  const [communities, setCommunities] = useState<Community[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberCommunities, setMemberCommunities] = useState<Set<string>>(new Set()); 
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasMore = communities.length < totalCount;

  console.log('CommunitiesPage State Initialized:', { isLoading, error, communitiesCount: communities.length }); // <<< ADD LOG HERE

  // --- Data Fetching ---
  const fetchCommunities = useCallback(async (isInitialLoad = false, currentSearchTerm = debouncedSearchTerm) => {
    console.log('fetchCommunities called:', { isInitialLoad, currentSearchTerm }); // <<< ADD LOG HERE
    setIsLoading(true);
    setError(null);
    const currentOffset = isInitialLoad ? 0 : communities.length;

    try {
      let backendUrl = `${API_BASE_URL}/communities?limit=${COMMUNITIES_PER_PAGE}&offset=${currentOffset}`;
      if (currentSearchTerm) {
        backendUrl += `&search=${encodeURIComponent(currentSearchTerm)}`;
      }
      console.log('Fetching from URL:', backendUrl); // <<< ADD LOG HERE

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(backendUrl, { headers }); 
      console.log('Fetch response status:', response.status); // <<< ADD LOG HERE
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      console.log('Fetch success, data received:', data); // <<< ADD LOG HERE

      // Simplify processing as backend now sends correct fields
      const processedItems = data.items.map(item => ({
        ...item,
        member_count: item.member_count ?? 0, // Keep default
        recentPosts: item.recentPosts ?? [] // Keep default
      }));

      setCommunities(prev => isInitialLoad ? processedItems : [...prev, ...processedItems]); // Use processedItems
      setTotalCount(data.totalCount);

    } catch (err: any) {
      console.error("Failed to fetch communities:", err);
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  // TODO: Review dependencies if loops occur
  }, [communities.length, t, debouncedSearchTerm, token]);

   // Effect for debouncing search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    };
  }, [searchTerm]);

  // Effect to refetch when debounced search term changes
  useEffect(() => {
    console.log('DebouncedSearchTerm Effect: term=', debouncedSearchTerm); // <<< ADD LOG HERE
    // Fetch initial batch or when debounced term changes
    fetchCommunities(true); 
  }, [debouncedSearchTerm, fetchCommunities]); // Run when debounced term changes

  // --- Join/Leave Handlers (Update member count locally) ---
  // NOTE: These handlers are copied from the previous read, ensure they are correct
  const handleJoin = async (communityId: string) => {
    if (!token) {
      console.error('No token available for join operation');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/members`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
         const errorText = await response.text();
         console.error(`Join failed! status: ${response.status}, response: ${errorText}`);
        throw new Error('Failed to join');
      }
      setMemberCommunities(prev => new Set(prev).add(communityId));
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community.id === communityId
            ? { ...community, member_count: community.member_count + 1 }
            : community
        )
      );
    } catch (error) {
       console.error('Error joining community:', error);
       throw error; 
    }
  };

  const handleLeave = async (communityId: string) => {
     if (!token) {
      console.error('No token available for leave operation');
      return;
    }
     try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/members/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
       if (!response.ok) {
         const errorText = await response.text();
         console.error(`Leave failed! status: ${response.status}, response: ${errorText}`);
        throw new Error('Failed to leave');
      }
      setMemberCommunities(prev => {
        const next = new Set(prev);
        next.delete(communityId);
        return next;
      });
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community.id === communityId
            ? { ...community, member_count: Math.max(0, community.member_count - 1) } 
            : community
        )
      );
    } catch (error) {
       console.error('Error leaving community:', error);
       throw error;
    }
  };

  // --- Search Handler ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateClick = () => {
    router.push('/communities/create'); 
  };
  
  console.log('>>> CommunitiesPage Component Render End'); // <<< ADD LOG HERE

  // --- Render Logic --- 
  if (isLoading && communities.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && communities.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Title and Create Button */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h4" component="h1">
          {t('nav.communities')}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreateClick}
          disabled={!isAuthenticated || !isVerified} // Disable if not auth or not verified
        >
          {t('community.create')}
        </Button>
      </Stack>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder={t('community.searchPlaceholder')}
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Infinite Scroll List */}
      <InfiniteScroll
        dataLength={communities.length}
        next={() => fetchCommunities(false)} // Fetch next page
        hasMore={hasMore}
        loader={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress />
          </Box>
        }
        endMessage={
          <Typography variant="caption" color="text.secondary" align="center" component="p" sx={{ py: 2 }}>
            {t('community.endOfList')}
          </Typography>
        }
        style={{ overflow: 'visible' }} // Prevent scroll issues
      >
        {/* Use Stack for vertical layout */}
        <Stack spacing={2}> 
          {communities.map((community) => (
              // Remove Grid item wrapper, key goes on the card
              <CommunityCard 
                key={community.id} // Key moved here
                community={community} 
                isMember={memberCommunities.has(community.id)}
                onJoin={handleJoin}
                onLeave={handleLeave}
                isAuthenticated={isAuthenticated}
              />
          ))}
        </Stack>
      </InfiniteScroll>

      {/* Handle case where there are no communities matching search */}
      {!isLoading && communities.length === 0 && totalCount === 0 && debouncedSearchTerm && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              {t('community.noResults')} 
            </Typography>
        </Box>
      )}
      
    </Container>
  );
} 