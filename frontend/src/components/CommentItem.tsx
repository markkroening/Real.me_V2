'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, parseISO, Locale } from 'date-fns';
import { enUS, fr, es } from 'date-fns/locale';
import {
  Box,
  Typography,
  Link as MuiLink,
  Stack,
  Tooltip,
  Avatar,
  Paper
} from '@mui/material';
import { createLocalizedUrl } from '@/lib/routeUtils';

export interface CommentData {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string | null;
  // Backend might return author data in either of these fields
  author?: {
    id: string;
    real_name: string;
    // avatar_url might be added later
  };
  profiles?: {
    id: string;
    real_name: string;
    email?: string;
    location?: string;
  };
}

interface CommentItemProps {
  comment: CommentData;
  isReply?: boolean;
}

const locales: { [key: string]: Locale } = { en: enUS, fr, es };

const formatRelativeTime = (dateString: string, locale?: Locale): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: locale });
  } catch (error) {
    console.error('Error parsing date for relative time:', error);
    return dateString;
  }
};

export default function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const { t, i18n } = useTranslation();
  
  // Log the comment structure to help diagnose issues
  console.log('Comment data:', {
    id: comment.id,
    author_id: comment.author_id,
    hasAuthorObj: !!comment.author,
    hasProfilesObj: !!comment.profiles,
    authorInfo: comment.author || comment.profiles,
    fullComment: comment
  });
  
  // We expect the author information to be normalized in the parent component
  const authorId = comment.author?.id || comment.author_id;
  const authorName = comment.author?.real_name || t('common.unknownUser', 'Unknown User');
  const authorUrl = authorId ? createLocalizedUrl(`u/${authorId}`) : '#';
  
  const currentLocale = locales[i18n.language] || enUS;
  const formattedTime = formatRelativeTime(comment.created_at, currentLocale);

  const authorInitials = authorName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <Paper 
      variant="outlined" 
      component="article"
      sx={{
        p: 1.5,
        mb: 1.5,
        ml: isReply ? 3 : 0,
        borderLeft: isReply ? '2px solid' : 'none',
        borderLeftColor: 'divider',
        borderRadius: 1
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Link href={authorUrl} passHref legacyBehavior>
          <MuiLink component="a" title={`View profile: ${authorName}`}>
            <Avatar
              alt=""
              // src={comment.author?.avatar_url || undefined} // Add when available
              sx={{ width: 24, height: 24, bgcolor: 'secondary.light' }}
            >
              {authorInitials}
            </Avatar>
          </MuiLink>
        </Link>

        <Box sx={{ flexGrow: 1 }}>
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            sx={{ mb: 0.25 }}
          >
            <MuiLink 
              component={Link} 
              href={authorUrl} 
              underline="hover" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.8rem',
                fontWeight: 400,
              }}
            >
              {authorName}
            </MuiLink>
            
            <Tooltip title={comment.created_at}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem' }}
              >
                {formattedTime}
              </Typography>
            </Tooltip>
          </Stack>

          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              color: 'text.primary',
              lineHeight: 1.4
            }}
          >
            {comment.content}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
} 