'use client';

import { ReactNode } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { People, Group, Explore } from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: 'people' | 'group' | 'explore';
  
  // Legacy props for backwards compatibility
  type?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  action,
  icon = 'people',
  
  // Handle legacy props
  type,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'group':
        return <Group sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />;
      case 'explore':
        return <Explore sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />;
      default:
        return <People sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />;
    }
  };

  // Support legacy prop format
  const actionElement = action || (actionLabel && onAction ? (
    <Button variant="contained" onClick={onAction}>
      {actionLabel}
    </Button>
  ) : null);

  return (
    <Paper
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {getIcon()}
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {description}
      </Typography>
      {actionElement && (
        <Box sx={{ mt: 2 }}>
          {actionElement}
        </Box>
      )}
    </Paper>
  );
} 