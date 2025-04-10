import { useTranslation } from 'react-i18next';
import {
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

interface LoadingIndicatorProps {
  variant?: 'spinner' | 'skeleton';
  skeletonVariant?: 'text' | 'rectangular' | 'rounded' | 'circular';
  skeletonCount?: number;
  skeletonHeight?: number | string;
  text?: string;
  fullPage?: boolean;
}

export const LoadingIndicator = ({
  variant = 'spinner',
  skeletonVariant = 'rectangular',
  skeletonCount = 3,
  skeletonHeight = 60,
  text,
  fullPage = false,
}: LoadingIndicatorProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const loadingText = text || t('common.loading');

  if (variant === 'skeleton') {
    return (
      <Stack spacing={2} sx={{ width: '100%' }}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton
            key={index}
            variant={skeletonVariant}
            height={skeletonHeight}
            animation="wave"
            sx={{
              bgcolor: theme.palette.mode === 'light' 
                ? 'grey.100' 
                : 'grey.900'
            }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100%',
        height: fullPage ? '50vh' : 'auto',
        py: fullPage ? 0 : 4,
      }}
      role="status"
      aria-label={loadingText}
    >
      <CircularProgress size={40} thickness={4} />
      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
      >
        {loadingText}
      </Typography>
    </Box>
  );
};

export default LoadingIndicator; 