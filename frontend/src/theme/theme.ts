import { createTheme } from '@mui/material/styles';
import { g10xColors, gradients } from './palette';

export const theme = createTheme({
  palette: {
    primary: {
      main: g10xColors.red.main,
      dark: g10xColors.red.dark,
    },
    secondary: {
      main: g10xColors.orange.main,
      light: g10xColors.orange.light,
    },
    background: {
      default: g10xColors.white,
      paper: g10xColors.white,
    },
    text: {
      primary: g10xColors.black,
      secondary: g10xColors.gray.main,
    },
  },
  typography: {
    fontFamily: [
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
      color: g10xColors.red.main,
    },
    h2: {
      fontWeight: 700,
      color: g10xColors.red.main,
    },
    h3: {
      fontWeight: 600,
      color: g10xColors.orange.main,
    },
    h4: {
      fontWeight: 600,
      color: g10xColors.orange.main,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          background: gradients.redToOrange,
          color: g10xColors.white,
          '&:hover': {
            background: gradients.darkRedToOrange,
          },
        },
        outlined: {
          borderColor: g10xColors.red.main,
          color: g10xColors.red.main,
          '&:hover': {
            borderColor: g10xColors.red.dark,
            backgroundColor: g10xColors.gray.light,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
