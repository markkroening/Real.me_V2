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
}

export default function EmptyState({
  title,
  description,
  action,
  icon = 'people',
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
      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </Paper>
  );
} 