import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define common typography and components settings
const commonSettings: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      },
    },
  },
};

// Light Theme Definition
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#ffffff',   // White paper background
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  ...commonSettings,
});

// Dark Theme Definition
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Lighter blue for dark mode
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: '#f48fb1', // Lighter pink for dark mode
      light: '#f8bbd0',
      dark: '#ec407a',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e',   // Slightly lighter dark for paper
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)', // Ensure divider is visible
  },
  ...commonSettings,
  // Override component styles for dark mode if needed
  components: {
    ...commonSettings.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...(commonSettings.components?.MuiCard?.styleOverrides?.root as object),
          backgroundColor: '#1e1e1e', // Explicitly set card background for dark
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', // Darker shadow
        },
      },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                ...(commonSettings.components?.MuiAppBar?.styleOverrides?.root as object),
                backgroundColor: '#1e1e1e', // Match paper color
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)', // Lighter border for dark
            },
        },
    },
  },
}); 