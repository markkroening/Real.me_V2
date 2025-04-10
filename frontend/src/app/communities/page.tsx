'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from '@mui/material';

// Define the structure of a Post and Community based on the backend response
interface Post {
  id: string;
  content: string;
  created_at: string;
}

interface Community {
  id: string;
  name: string;
  description: string | null;
  recentPosts: Post[];
}

// Define the structure of the API response
interface ApiResponse {
  items: Community[];
  totalCount: number;
}

const COMMUNITIES_PER_PAGE = 10;

export default function CommunitiesPage() {
  const { t } = useTranslation();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasMore = communities.length < totalCount;

  useEffect(() => {
    fetchCommunities(0); // Fetch initial batch
  }, []);

  const fetchCommunities = async (currentOffset: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the correct absolute backend URL
      const backendUrl = `http://localhost:3001/communities?limit=${COMMUNITIES_PER_PAGE}&offset=${currentOffset}`;
      console.log(`Fetching communities from: ${backendUrl}`); // Add log for debugging
      const response = await fetch(backendUrl);
      if (!response.ok) {
        // Log the response status and text for better debugging
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      
      setCommunities(prev => currentOffset === 0 ? data.items : [...prev, ...data.items]);
      setTotalCount(data.totalCount);
      // *** Correction: Update offset based on the new length, not currentOffset ***
      setOffset(prevOffset => prevOffset + data.items.length); 

    } catch (err: any) {
      console.error("Failed to fetch communities:", err);
      setError(t('errors.generic')); // Use a generic error message
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      // Fetch using the current length as the offset for the *next* page
      fetchCommunities(communities.length);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('nav.communities')} {/* Use translation key */}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* TODO: Implement Infinite Scroll component or logic here */}
      {/* For now, just render the list and a loading indicator/button */}
      
      <List disablePadding>
        {communities.map((community, index) => (
          <ListItem key={community.id} disablePadding sx={{ mb: 3 }}>
            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {community.name}
                </Typography>
                {community.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {community.description}
                  </Typography>
                )}
                {community.recentPosts.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Recent Posts:
                    </Typography>
                    <List dense disablePadding>
                      {community.recentPosts.map(post => (
                        <ListItem key={post.id} sx={{ 
                          pt: 0.5, 
                          pb: 0.5, 
                          // Basic fade out effect (can be improved with gradients)
                          opacity: 1 - (community.recentPosts.findIndex(p => p.id === post.id) * 0.25),
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }}>
                          <Typography variant="caption" color="text.secondary">
                            {post.content}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
              {/* TODO: Add Join button? */} 
            </Card>
          </ListItem>
        ))}
      </List>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && hasMore && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Button onClick={loadMore} variant="outlined">
            Load More
          </Button>
        </Box>
      )}

      {!isLoading && !hasMore && communities.length > 0 && (
         <Typography variant="caption" color="text.secondary" align="center" component="p" sx={{ py: 2 }}>
            You've reached the end.
         </Typography>
      )}

      {!isLoading && communities.length === 0 && !error && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
          No communities found.
        </Typography>
      )}

    </Container>
  );
} 