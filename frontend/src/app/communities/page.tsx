'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Button,
  TextField, // Import TextField
  Stack,     // Import Stack for layout
  InputAdornment // For search icon
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Icon for create button
import InfiniteScroll from 'react-infinite-scroll-component'; // Import infinite scroll
import SearchIcon from '@mui/icons-material/Search'; // Import SearchIcon

import CommunityCard from '@/components/CommunityCard'; // Import the card component
import { useAuth } from '@/contexts/AuthContext'; // Import auth context
import { useVerification } from '@/contexts/VerificationContext'; // Import verification context

// Define the structure of a Post based on the backend response
interface Post {
  id: string;
  content: string;
  created_at: string;
}

// Update Community interface to match actual backend response
export interface Community { // Export if used by CommunityCard directly
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
  recentPosts: Post[];
}

// Define the structure of the API response
interface ApiResponse {
  items: Community[];
  totalCount: number;
}

const COMMUNITIES_PER_PAGE = 10;
const API_BASE_URL = 'http://localhost:3001/api/v1'; // Update base URL with prefix

export default function CommunitiesPage() {
  const { t } = useTranslation();
  const router = useRouter(); // Initialize router
  const { isAuthenticated, user, token } = useAuth(); // Get auth state and token
  const { status: verificationStatus } = useVerification(); // Get verification status
  const isVerified = verificationStatus === 'verified';

  const [communities, setCommunities] = useState<Community[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberCommunities, setMemberCommunities] = useState<Set<string>>(new Set()); // Track memberships locally
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // Debounced value
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for timeout ID

  const hasMore = communities.length < totalCount;

  // --- Data Fetching ---
  const fetchCommunities = useCallback(async (isInitialLoad = false, currentSearchTerm = debouncedSearchTerm) => {
    setIsLoading(true);
    setError(null);
    const currentOffset = isInitialLoad ? 0 : communities.length;

    try {
      let backendUrl = `${API_BASE_URL}/communities?limit=${COMMUNITIES_PER_PAGE}&offset=${currentOffset}`;
      if (currentSearchTerm) {
        backendUrl += `&search=${encodeURIComponent(currentSearchTerm)}`;
      }

      // Prepare headers, including auth token if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(backendUrl, { headers }); // Add headers to fetch options
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();

      // Simplify processing as backend now sends correct fields
      const processedItems = data.items.map(item => ({
        ...item,
        member_count: item.member_count ?? 0, // Still good to keep default
        recentPosts: item.recentPosts ?? [] // Keep default
      }));

      setCommunities(prev => isInitialLoad ? processedItems : [...prev, ...processedItems]);
      setTotalCount(data.totalCount);

    } catch (err: any) {
      console.error("Failed to fetch communities:", err);
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
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
    // Fetch initial batch or when debounced term changes
    fetchCommunities(true); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, fetchCommunities]); // Rely on memoized fetchCommunities

  // --- Join/Leave Handlers (Update member count locally) ---
  const handleJoin = async (communityId: string) => {
    if (!token) {
      console.error('No token available for join operation');
      // Optionally trigger login prompt
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
      // Update local membership state
      setMemberCommunities(prev => new Set(prev).add(communityId));
      // Update local member count for the specific community
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community.id === communityId
            ? { ...community, member_count: community.member_count + 1 }
            : community
        )
      );
    } catch (error) {
       console.error('Error joining community:', error);
       throw error; // Re-throw for potential handling in CommunityCard loading state
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
      // Update local membership state
      setMemberCommunities(prev => {
        const next = new Set(prev);
        next.delete(communityId);
        return next;
      });
      // Update local member count for the specific community
      setCommunities(prevCommunities => 
        prevCommunities.map(community => 
          community.id === communityId
            ? { ...community, member_count: Math.max(0, community.member_count - 1) } // Prevent negative count
            : community
        )
      );
    } catch (error) {
       console.error('Error leaving community:', error);
       throw error; // Re-throw
    }
  };

  // --- Search Handler ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Debounce logic is handled by useEffect
  };

  const handleCreateClick = () => {
    router.push('/communities/create'); // Navigate to create page
  };

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
          // TODO: Add check if user is allowed to create (e.g., verified)
          // disabled={!isVerified}
        >
          {t('community.create')} {/* Use existing key */}
        </Button>
      </Stack>

      {/* Search Bar - Add icon and highlight styling */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder={t('common.searchPlaceholder')}
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          // Highlight background when search term is active
          backgroundColor: searchTerm ? theme => theme.palette.action.hover : 'transparent',
          transition: 'background-color 0.3s', // Smooth transition
          borderRadius: 1, // Match theme border radius if needed
        }}
      />

      {/* Error Display */}
      {error && !isLoading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Initial Loading State */} 
      {isLoading && communities.length === 0 && (
         <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Community List with Infinite Scroll */} 
      {!isLoading && communities.length === 0 && !error && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
          No communities found.
        </Typography>
      )}

      {communities.length > 0 && (
         <InfiniteScroll
            dataLength={communities.length}
            next={() => fetchCommunities(false, debouncedSearchTerm)} // Pass search term
            hasMore={hasMore}
            loader={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            }
            endMessage={
              <Typography variant="caption" color="text.secondary" align="center" component="p" sx={{ py: 2 }}>
                You've reached the end.
              </Typography>
            }
            style={{ overflow: 'visible' }} // Prevent potential scrollbar issues
          >
            <List disablePadding sx={{ pt: 2 }}> {/* Add padding top */} 
              {communities.map((community) => (
                <ListItem key={community.id} disablePadding sx={{ mb: 3 }}>
                  <CommunityCard
                    community={community} 
                    isMember={memberCommunities.has(community.id)}
                    isAuthenticated={isAuthenticated}
                    // No isVerified needed
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                  />
                </ListItem>
              ))}
            </List>
         </InfiniteScroll>
      )}

      {/* Remove the old Load More button and logic */}

    </Container>
  );
} 