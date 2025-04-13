'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  Tooltip,
  Stack,
  IconButton,
  CardActionArea,
  CircularProgress,
} from '@mui/material';
import {
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Community } from '../app/communities/page'; // Import Community type from page

interface CommunityCardProps {
  community: Community; // Use the imported Community type
  isMember: boolean;
  isAuthenticated: boolean;
  onJoin: (communityId: string) => Promise<void>;
  onLeave: (communityId: string) => Promise<void>;
}

export default function CommunityCard({
  community,
  isMember,
  isAuthenticated,
  onJoin,
  onLeave,
}: CommunityCardProps) {
  const { t, i18n } = useTranslation();
  const [isJoiningOrLeaving, setIsJoiningOrLeaving] = React.useState(false);

  // Use a more robust way to generate community URL if needed
  const communityUrl = `/c/${community.id}`; 

  // --- Button Logic ---
  let buttonText = t('community.join');
  let buttonVariant: "contained" | "outlined" | "text" = "contained";
  let buttonColor: "primary" | "secondary" | "inherit" | "success" | "error" | "info" | "warning" = "primary";
  let buttonDisabled = false;
  let buttonTooltip = '';
  let buttonAction = () => handleJoin(); // Default action

  if (isMember) {
    buttonText = t('community.joined');
    buttonVariant = "outlined";
    buttonAction = () => handleLeave();
    buttonColor = "success";
  } else if (!isAuthenticated) {
    buttonDisabled = true;
    buttonTooltip = t('auth.loginRequired'); 
  }

  // Add loading state for join/leave
  buttonDisabled = buttonDisabled || isJoiningOrLeaving;

  // --- Handlers ---
  const handleJoin = async (event?: React.MouseEvent) => {
    event?.stopPropagation(); 
    if (buttonDisabled || isMember) return;

    setIsJoiningOrLeaving(true);
    try {
      await onJoin(community.id);
    } catch (error) {
      console.error("Failed to join community:", error);
    } finally {
      setIsJoiningOrLeaving(false);
    }
  };

  const handleLeave = async (event?: React.MouseEvent) => {
    event?.stopPropagation(); 
    if (buttonDisabled || !isMember) return;

    setIsJoiningOrLeaving(true);
    try {
      await onLeave(community.id);
    } catch (error) {
      console.error("Failed to leave community:", error);
    } finally {
      setIsJoiningOrLeaving(false);
    }
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) {
      event.preventDefault();
    }
  };

  // --- Render ---
  return (
    <Card variant="outlined" component="article" sx={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Link href={communityUrl} passHref legacyBehavior>
        <CardContent sx={{ pt: 2, pb: 1, pr: 2, pl: 2 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              alt=""
              sx={{ width: 40, height: 40, bgcolor: 'primary.light', mt: 0.5 }}
            >
              {community.name ? community.name.charAt(0).toUpperCase() : <GroupIcon />}
            </Avatar>

            <Box sx={{ flexGrow: 1, overflow: 'hidden', pb: 4 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ mb: 0.5, fontSize: '1.1rem', lineHeight: 1.3, fontWeight: 500 }}
              >
                {community.name}
              </Typography>
              {community.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  title={community.description}
                  sx={{ 
                      mb: 0.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                  }}
                >
                  {community.description}
                </Typography>
              )}
               <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                 {t('community.members', { count: community.member_count })}
               </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Link>

      <Tooltip title={buttonTooltip} placement="top">
          <span style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
              <Button
                variant={buttonVariant}
                color={buttonColor}
                size="small"
                onClick={buttonAction}
                disabled={buttonDisabled}
                aria-label={isMember ? t('community.leaveLabel', { name: community.name }) : t('community.joinLabel', { name: community.name })}
                sx={{ minWidth: '80px' }}
              >
              {isJoiningOrLeaving ? <CircularProgress size={20} color="inherit"/> : buttonText}
              {isMember && !isJoiningOrLeaving && <CheckCircleIcon fontSize="inherit" sx={{ ml: 0.5 }} />}
              </Button>
          </span>
      </Tooltip>
    </Card>
  );
} 