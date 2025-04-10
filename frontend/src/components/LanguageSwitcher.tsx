'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { supportedLngs, getLanguageNativeName, type SupportedLanguage } from '@/i18n/settings';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
    handleClose();
    
    // Update the URL to reflect the new language
    const newPath = pathname.replace(/^\/[a-z]{2}/, '');
    router.push(`/${lng}${newPath}`);
  };

  return (
    <Box>
      <Tooltip title={t('common.changeLanguage')}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label={t('common.changeLanguage')}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {supportedLngs.map((lng) => (
          <MenuItem
            key={lng}
            onClick={() => changeLanguage(lng)}
            selected={i18n.language === lng}
          >
            <Typography variant="body2">
              {getLanguageNativeName(lng)}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
} 