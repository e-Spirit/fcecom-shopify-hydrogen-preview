/**
 * === CFC ===
 * MUI theme configuration for the project
 * Colors, typography, component styles, etc. are customized here
 */
import {createTheme} from '@mui/material/styles';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Tailwind blue-500
      light: '#60a5fa', // Tailwind blue-400
      dark: '#2563eb', // Tailwind blue-600
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // Tailwind violet-500
      light: '#a78bfa', // Tailwind violet-400
      dark: '#7c3aed', // Tailwind violet-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // Tailwind red-500
    },
    warning: {
      main: '#f59e0b', // Tailwind amber-500
    },
    info: {
      main: '#3b82f6', // Tailwind blue-500
    },
    success: {
      main: '#10b981', // Tailwind emerald-500
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb', // Tailwind gray-50
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.375rem', // Tailwind rounded-md
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem', // Tailwind rounded-md
        },
      },
    },
  },
});

export default theme;
