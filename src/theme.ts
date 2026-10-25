import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#aa3bff',
          light: '#c77dff',
          dark: '#7b1fd6',
          contrastText: '#ffffff',
        },
        background: { default: '#ffffff', paper: '#ffffff' },
        text: { primary: '#08060d', secondary: '#6b6375' },
        divider: '#e5e4e7',
      },
    },
  },
  typography: {
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",

    // 👇 this is what fixes "fonts too big"
    htmlFontSize: 16,
    fontSize: 16,
    body1: { fontSize: '1rem', lineHeight: 1.65 },
    body2: { fontSize: '0.9375rem', lineHeight: 1.6 },
    caption: { fontSize: '0.8125rem', lineHeight: 1.4 },

    h1: {
      fontWeight: 500,
      letterSpacing: '-0.03em',
      fontSize: 'clamp(2rem, 1.4rem + 2vw, 2.75rem)',
      lineHeight: 1.15,
    },
    h2: {
      fontWeight: 500,
      letterSpacing: '-0.01em',
      fontSize: '1.25rem',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.35,
      letterSpacing: '-0.005em',
    },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiContainer: {
      defaultProps: { maxWidth: 'md' },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiChip: {
      styleOverrides: {
        sizeSmall: { height: 24, fontSize: '0.75rem' },
      },
    },
    MuiPagination: {
      defaultProps: { shape: 'rounded' },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
    },
  },
})