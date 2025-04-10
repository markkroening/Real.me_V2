import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';

interface UserMenuProps {
  isLoggedIn: boolean;
  user?: {
    name: string;
    avatar?: string;
  };
  onLogout: () => void;
  isMobile?: boolean;
}

export const UserMenu = ({ isLoggedIn, user, onLogout, isMobile }: UserMenuProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!isLoggedIn) {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          component={Link}
          href="/login"
          variant="outlined"
          color="inherit"
          size={isMobile ? 'small' : 'medium'}
        >
          {t('auth.login')}
        </Button>
        <Button
          component={Link}
          href="/signup"
          variant="contained"
          color="primary"
          size={isMobile ? 'small' : 'medium'}
        >
          {t('auth.signup')}
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Tooltip title={t('profile.menu')}>
        <IconButton
          onClick={handleClick}
          aria-controls={open ? 'user-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          aria-label={t('profile.menu')}
        >
          {user?.avatar ? (
            <Avatar
              alt={user.name}
              src={user.avatar}
              sx={{ width: 32, height: 32 }}
            />
          ) : (
            <Avatar sx={{ width: 32, height: 32 }}>{user?.name?.[0]}</Avatar>
          )}
        </IconButton>
      </Tooltip>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={Link} href="/profile">
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('profile.view')}</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href="/settings">
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('profile.settings')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('auth.logout')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu; 