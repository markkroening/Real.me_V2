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
  IconButton,
  Avatar,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import CommentIcon from '@mui/icons-material/ChatBubbleOutline';
import { createLocalizedUrl } from '@/lib/routeUtils';

export interface PostSummary {
  id: string;
  title: string;
  content_snippet?: string | null;
  author: {
    id: string;
    real_name: string;
  };
  community: {
    id: string;
    name: string;
    icon_url?: string | null;
  };
  comment_count: number;
  created_at: string;
}

interface PostItemProps {
  post: PostSummary;
  showCommunityLink?: boolean;
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

export default function PostItem({ post, showCommunityLink = false }: PostItemProps) {
  const { t, i18n } = useTranslation();
  
  // Define the raw paths without locale prefix
  const rawPostUrl = `c/${post.community.id}/post/${post.id}`;
  const rawAuthorUrl = `u/${post.author.id}`;
  const rawCommunityUrl = `c/${post.community.id}`;
  
  // Create localized URLs
  const postUrl = createLocalizedUrl(rawPostUrl);
  const authorUrl = createLocalizedUrl(rawAuthorUrl);
  const communityUrl = createLocalizedUrl(rawCommunityUrl);
  const commentsUrl = `${postUrl}#comments`;

  const currentLocale = locales[i18n.language] || enUS;
  const formattedTime = formatRelativeTime(post.created_at, currentLocale);

  const authorInitials = post.author.real_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  const communityInitials = post.community.name?.[0]?.toUpperCase() || 'C';

  return (
    <Card 
      variant="outlined" 
      component="article"
      aria-labelledby={`post-title-${post.id}`}
      sx={{
        mb: 2,
        width: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Link href={communityUrl} passHref legacyBehavior>
            <MuiLink component="a" title={`View community: ${post.community.name}`}>
              <Avatar
                alt=""
                src={post.community.icon_url || undefined}
                sx={{ width: 40, height: 40, bgcolor: 'primary.light', mt: 0.5 }}
              >
                {communityInitials}
              </Avatar>
            </MuiLink>
          </Link>

          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <MuiLink
              component={Link}
              href={postUrl}
              underline="hover"
              color="inherit"
              id={`post-title-${post.id}`}
              sx={{ 
                  display: 'block', 
                  mb: 0.5, 
               }}
            >
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 600, lineHeight: 1.3 }}
              >
                {post.title}
              </Typography>
            </MuiLink>

            {post.content_snippet && (
               <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 1, 
                  display: '-webkit-box',
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4, 
               }}>
                 {post.content_snippet}
               </Typography>
            )}

            <Stack 
              direction="row" 
              spacing={1.5} 
              alignItems="center" 
              flexWrap="wrap"
              sx={{ typography: 'caption', color: 'text.secondary' }}
            >
                <MuiLink component={Link} href={communityUrl} underline="hover" color="inherit">
                    {post.community.name}
                </MuiLink>
                <span>• Posted by</span>
                <MuiLink component={Link} href={authorUrl} underline="hover" color="inherit">
                    {post.author.real_name}
                </MuiLink>
                <Tooltip title={post.created_at}> 
                  <span> • {formattedTime}</span>
                </Tooltip>
                
                 <MuiLink
                    component={Link}
                    href={commentsUrl}
                    underline="hover"
                    color="inherit"
                    aria-label={t('post.commentsLabel', { count: post.comment_count })}
                    sx={{ display: 'inline-flex', alignItems: 'center', ml: 'auto' }}
                 >
                    <CommentIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    {post.comment_count}
                 </MuiLink>
            </Stack>

          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
} 