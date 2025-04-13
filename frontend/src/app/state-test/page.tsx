'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Divider,
  Grid as MuiGrid,
  Paper,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/LoadingIndicator';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

const Grid = MuiGrid as typeof MuiGrid & {
  item: boolean;
};

export default function StateTestPage() {
  const { t } = useTranslation();
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleEmptyAction = () => {
    console.log('Empty state action clicked');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('nav.stateTest')}
      </Typography>

      {/* Loading States */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Loading States
        </Typography>
        <MuiGrid container spacing={3}>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Spinner
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2 }}>
              <LoadingIndicator />
            </Box>
          </MuiGrid>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Skeleton
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2 }}>
              <LoadingIndicator variant="skeleton" />
            </Box>
          </MuiGrid>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Custom Text
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 2 }}>
              <LoadingIndicator text="Loading posts..." />
            </Box>
          </MuiGrid>
        </MuiGrid>
      </Paper>

      {/* Error States */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Error States
        </Typography>
        <MuiGrid container spacing={3}>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Default Error
            </Typography>
            <ErrorMessage
              message="Please check your connection and try again"
              onRetry={handleRetry}
            />
          </MuiGrid>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Inline Error
            </Typography>
            <ErrorMessage
              message="Your comment could not be posted"
              onRetry={handleRetry}
            />
          </MuiGrid>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Toast Error
            </Typography>
            <ErrorMessage
              message="Unable to reach the server"
            />
          </MuiGrid>
        </MuiGrid>
        <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
          Retry count: {retryCount}
        </Typography>
      </Paper>

      {/* Empty States */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Empty States
        </Typography>
        <MuiGrid container spacing={3}>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Feed Empty
            </Typography>
            <EmptyState
              title="No Posts Yet"
              description="There are no posts to display"
              icon="people"
              action={
                <Button variant="contained" onClick={handleEmptyAction}>
                  Create Post
                </Button>
              }
            />
          </MuiGrid>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Search Empty
            </Typography>
            <EmptyState
              title="No Results"
              description="No results found for 'test query'"
              icon="explore"
            />
          </MuiGrid>
          <MuiGrid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Comments Empty
            </Typography>
            <EmptyState
              title="No Comments"
              description="Be the first to comment"
              icon="group"
              action={
                <Button variant="contained" onClick={handleEmptyAction}>
                  Add Comment
                </Button>
              }
            />
          </MuiGrid>
        </MuiGrid>
      </Paper>

      {/* Full Page Examples */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Full Page Examples
        </Typography>
        <Stack spacing={2}>
          <Button
            variant="outlined"
            onClick={() => window.open('/state-test/loading', '_blank')}
          >
            View Full Page Loading
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open('/state-test/error', '_blank')}
          >
            View Full Page Error
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open('/state-test/empty', '_blank')}
          >
            View Full Page Empty State
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
} 