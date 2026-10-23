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
    dark: {
      palette: {
        primary: {
          main: '#c084fc',
          light: '#d8b4fe',
          dark: '#a855f7',
          contrastText: '#08060d',
        },
        background: { default: '#16171d', paper: '#1f2028' },
        text: { primary: '#f3f4f6', secondary: '#9ca3af' },
        divider: '#2e303a',
      },
    },
  },
  typography: {
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 500, letterSpacing: '-0.03em' },
    h2: { fontWeight: 500, letterSpacing: '-0.01em' },
    h5: { fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
})
