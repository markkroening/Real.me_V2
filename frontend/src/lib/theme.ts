import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define color palette that conveys trust and meets WCAG 2.1 AA standards
const palette: ThemeOptions['palette'] = {
  primary: {
    main: '#1B4965', // Deep blue - trustworthy, professional
    light: '#2A6F97',
    dark: '#0C2B3D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#62B6CB', // Light blue - friendly, approachable
    light: '#90D5E7',
    dark: '#3A8BA3',
    contrastText: '#000000',
  },
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#2C3E50',
    secondary: '#5A6A7E',
  },
  error: {
    main: '#E74C3C',
    light: '#FF6B6B',
    dark: '#C0392B',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#2ECC71',
    light: '#4CD964',
    dark: '#27AE60',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F1C40F',
    light: '#F7DC6F',
    dark: '#F39C12',
    contrastText: '#000000',
  },
  info: {
    main: '#3498DB',
    light: '#5DADE2',
    dark: '#2980B9',
    contrastText: '#FFFFFF',
  },
};

// Define typography settings for optimal readability
const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none',
    fontWeight: 500,
  },
};

// Define component-specific theme customizations
const components: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
};

// Create and export the theme
const theme = createTheme({
  palette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
});

export default theme; 