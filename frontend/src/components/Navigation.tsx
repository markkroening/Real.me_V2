'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  AccountCircle,
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import Link from 'next/link';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useThemeContext } from './ThemeProvider';
import { useVerification } from '@/contexts/VerificationContext';
import { useAuth } from '@/contexts/AuthContext';
import VerificationStatus from './VerificationStatus';
import { useRouter } from 'next/navigation';
import { fallbackLng, supportedLngs } from '@/i18n/settings';

export default function Navigation() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const { status } = useVerification();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const router = useRouter();

  // Get the current locale from the URL
  const getCurrentLocale = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const locale = pathname.split('/')[1];
      return supportedLngs.includes(locale as any) ? locale : fallbackLng;
    }
    return fallbackLng;
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
      const currentLocale = getCurrentLocale();
      router.push(`/${currentLocale}/login`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);

  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';

  // Get the display name for the user
  const getDisplayName = () => {
    if (user?.real_name) {
      return user.real_name;
    }
    return 'spectre';
  };

  // Get the current locale for links
  const currentLocale = getCurrentLocale();

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        component={Link}
        href="/profile"
        onClick={handleMenuClose}
      >
        {t('profile.view')}
      </MenuItem>
      <MenuItem
        component={Link}
        href="/settings"
        onClick={handleMenuClose}
      >
        {t('profile.settings')}
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        {t('auth.logout')}
      </MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        component={Link}
        href={`/${currentLocale}`}
        onClick={handleMenuClose}
      >
        {t('nav.home')}
      </MenuItem>
      <MenuItem
        component={Link}
        href={`/${currentLocale}/communities`}
        onClick={handleMenuClose}
      >
        {t('nav.communities')}
      </MenuItem>
      {isAuthenticated && (
        <Box>
          <MenuItem
            component={Link}
            href="/profile"
            onClick={handleMenuClose}
          >
            {t('profile.view')}
          </MenuItem>
          <MenuItem
            component={Link}
            href="/settings"
            onClick={handleMenuClose}
          >
            {t('profile.settings')}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            {t('auth.logout')}
          </MenuItem>
        </Box>
      )}
    </Menu>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label={t('nav.menu')}
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Link href={`/${currentLocale}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Logo size="small" />
            </Link>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button
              component={Link}
              href={`/${currentLocale}`}
              color="inherit"
            >
              {t('nav.home')}
            </Button>
            <Button
              component={Link}
              href={`/${currentLocale}/communities`}
              color="inherit"
            >
              {t('nav.communities')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <LanguageSwitcher />

            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    ...(user?.real_name ? {} : {
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    })
                  }}
                >
                  {getDisplayName()}
                </Typography>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label={t('nav.menu')}
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                {renderMenu}
              </Box>
            ) : (
              <Button
                component={Link}
                href={`/${currentLocale}/login`}
                color="inherit"
              >
                {t('auth.login')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
      {renderMobileMenu}
    </AppBar>
  );
} 