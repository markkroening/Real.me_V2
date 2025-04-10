'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ showText = true, size = 'medium' }: LogoProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: '1.5rem', gap: 0.5 };
      case 'large':
        return { fontSize: '2.5rem', gap: 1 };
      default:
        return { fontSize: '2rem', gap: 0.75 };
    }
  };

  const { fontSize, gap } = getSize();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap,
      }}
    >
      <Box
        sx={{
          width: fontSize,
          height: fontSize,
          borderRadius: '50%',
          bgcolor: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.primary.contrastText,
          fontWeight: 'bold',
          fontSize: `calc(${fontSize} * 0.6)`,
        }}
      >
        R
      </Box>
      {showText && (
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontWeight: 700,
            fontSize,
            color: theme.palette.text.primary,
          }}
        >
          {t('app.name')}
        </Typography>
      )}
    </Box>
  );
} 