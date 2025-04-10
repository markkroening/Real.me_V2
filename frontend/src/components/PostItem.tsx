'use client';

import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Avatar,
  Link as MuiLink,
} from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PostItemProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    author: {
      id: string;
      username: string;
      avatar: string | null;
      isVerified?: boolean;
    };
    community: {
      id: string;
      name: string;
      slug: string;
    };
    likes_count: number;
    comments_count: number;
  };
}

export default function PostItem({ post }: PostItemProps) {
  const { t } = useTranslation();
  
  // Format the date to a relative time (e.g., "2 hours ago")
  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  
  // Truncate content to a reasonable length
  const truncatedContent = post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardHeader
        avatar={
          <Link href={`/u/${post.author.id}`} style={{ textDecoration: 'none' }}>
            <Avatar 
              src={post.author.avatar || undefined}
              sx={{ bgcolor: 'primary.main' }}
              aria-label={post.author.username}
            >
              {post.author.username.charAt(0)}
            </Avatar>
          </Link>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link href={`/u/${post.author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body1" component="span">
                {post.author.username}
              </Typography>
            </Link>
            {post.author.isVerified && (
              <VerifiedIcon 
                color="primary" 
                fontSize="small" 
                aria-label={t('profile.verified')}
              />
            )}
          </Box>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Link href={`/c/${post.community.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2" color="text.secondary" component="span">
                {t('post.in')} {post.community.name}
              </Typography>
            </Link>
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ mb: 1 }}>
          <Link href={`/p/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" component="h2">
              {post.title}
            </Typography>
          </Link>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {truncatedContent}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {post.likes_count} {t('post.likes')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.comments_count} {t('post.comments')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 