import { createTheme } from '@mui/material/styles'
import {
  getThemePreset,
  THEME_FONTS,
  THEME_RADIUS_OPTIONS,
  type ThemeFontId,
  type ThemePresetId,
  type ThemeRadiusId,
} from './config/themePresets'

export function createAppTheme(
  presetId: ThemePresetId = 'violet',
  fontId: ThemeFontId = 'sans',
  radiusId: ThemeRadiusId = 'rounded',
) {
  const preset = getThemePreset(presetId)
  const fontFamily = (THEME_FONTS[fontId] ?? THEME_FONTS.sans).fontFamily
  const borderRadius = (THEME_RADIUS_OPTIONS[radiusId] ?? THEME_RADIUS_OPTIONS.rounded).borderRadius

  return createTheme({
    cssVariables: {
      colorSchemeSelector: 'data',
    },
    colorSchemes: {
      light: { palette: preset.light },
      dark: { palette: preset.dark },
    },
    typography: {
      fontFamily,
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
    shape: { borderRadius },
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
}

export const theme = createAppTheme()
