import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const SearchBar = ({ isMobile, onClose }: SearchBarProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        width: isMobile ? '100%' : { xs: '200px', sm: '300px', md: '400px' },
      }}
    >
      <TextField
        fullWidth
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('common.searchPlaceholder')}
        aria-label={t('common.search')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <Tooltip title={t('common.clear')}>
                <IconButton
                  size="small"
                  onClick={() => setQuery('')}
                  aria-label={t('common.clear')}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{
          bgcolor: 'background.paper',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
    </Box>
  );
};

export default SearchBar; 