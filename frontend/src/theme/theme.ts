import { createTheme } from '@mui/material/styles';
import { designSystemColors, g10xColors } from './palette';

export const theme = createTheme({
  palette: {
    primary: {
      main: designSystemColors.accent.primary,
      dark: designSystemColors.accent.hover,
    },
    background: {
      default: designSystemColors.background,
      paper: designSystemColors.surface,
    },
    text: {
      primary: designSystemColors.text.primary,
      secondary: designSystemColors.text.secondary,
    },
    divider: designSystemColors.divider,
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h1: {
      fontSize: '26px',
      fontWeight: 600,
      lineHeight: 1.25,
      color: designSystemColors.text.primary,
    },
    h2: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.25,
      color: designSystemColors.text.primary,
    },
    h3: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.25,
      color: designSystemColors.text.primary,
    },
    h4: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.25,
      color: designSystemColors.text.primary,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.6,
      color: designSystemColors.text.primary,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.6,
      color: designSystemColors.text.secondary,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.6,
      color: designSystemColors.text.secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '14px',
    },
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          height: '44px',
          padding: '0 24px',
          fontSize: '14px',
          fontWeight: 500,
        },
        contained: {
          background: designSystemColors.accent.primary,
          color: designSystemColors.surface,
          '&:hover': {
            background: designSystemColors.accent.hover,
          },
        },
        outlined: {
          borderColor: designSystemColors.border,
          color: designSystemColors.text.primary,
          '&:hover': {
            borderColor: designSystemColors.accent.primary,
            backgroundColor: designSystemColors.accent.soft,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${designSystemColors.border}`,
          boxShadow: 'none',
          padding: '20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            height: '44px',
            '& fieldset': {
              borderColor: designSystemColors.border,
            },
            '&:hover fieldset': {
              borderColor: designSystemColors.border,
            },
            '&.Mui-focused fieldset': {
              borderColor: designSystemColors.accent.primary,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${designSystemColors.border}`,
        },
      },
    },
  },
});
