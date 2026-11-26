export type ThemePresetId = 'violet' | 'ocean' | 'emerald' | 'sepia' | 'mono'
export type ThemeFontId = 'sans' | 'serif' | 'mono'
export type ThemeRadiusId = 'sharp' | 'rounded' | 'soft'

export interface ThemePaletteSpec {
  primary: {
    main: string
    light: string
    dark: string
    contrastText: string
  }
  background: {
    default: string
    paper: string
  }
  text: {
    primary: string
    secondary: string
  }
  divider: string
}

export interface ThemePreset {
  id: ThemePresetId
  label: string
  swatch: string
  light: ThemePaletteSpec
  dark: ThemePaletteSpec
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'violet',
    label: 'Violet',
    swatch: '#aa3bff',
    light: {
      primary: { main: '#aa3bff', light: '#c77dff', dark: '#7b1fd6', contrastText: '#ffffff' },
      background: { default: '#ffffff', paper: '#ffffff' },
      text: { primary: '#08060d', secondary: '#6b6375' },
      divider: '#e5e4e7',
    },
    dark: {
      primary: { main: '#c084fc', light: '#d8b4fe', dark: '#9333ea', contrastText: '#0b0a10' },
      background: { default: '#0f0e14', paper: '#181620' },
      text: { primary: '#f4f2f7', secondary: '#a39bb0' },
      divider: '#2b2836',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    swatch: '#2563eb',
    light: {
      primary: { main: '#2563eb', light: '#60a5fa', dark: '#1d4ed8', contrastText: '#ffffff' },
      background: { default: '#f8fafc', paper: '#ffffff' },
      text: { primary: '#0f172a', secondary: '#475569' },
      divider: '#e2e8f0',
    },
    dark: {
      primary: { main: '#60a5fa', light: '#93c5fd', dark: '#3b82f6', contrastText: '#08101e' },
      background: { default: '#0b1120', paper: '#111827' },
      text: { primary: '#f1f5f9', secondary: '#94a3b8' },
      divider: '#1e293b',
    },
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: '#059669',
    light: {
      primary: { main: '#059669', light: '#34d399', dark: '#047857', contrastText: '#ffffff' },
      background: { default: '#f7fbf9', paper: '#ffffff' },
      text: { primary: '#062016', secondary: '#4b6358' },
      divider: '#dcebe3',
    },
    dark: {
      primary: { main: '#34d399', light: '#6ee7b7', dark: '#10b981', contrastText: '#051a12' },
      background: { default: '#0a1410', paper: '#111e19' },
      text: { primary: '#ecfdf5', secondary: '#8fb3a4' },
      divider: '#1f332a',
    },
  },
  {
    id: 'sepia',
    label: 'Warm Paper',
    swatch: '#b45309',
    light: {
      primary: { main: '#b45309', light: '#f59e0b', dark: '#92400e', contrastText: '#ffffff' },
      background: { default: '#f5efe2', paper: '#faf6ee' },
      text: { primary: '#292018', secondary: '#6b5d4f' },
      divider: '#e4dac7',
    },
    dark: {
      primary: { main: '#fbbf24', light: '#fcd34d', dark: '#d97706', contrastText: '#1c1408' },
      background: { default: '#171411', paper: '#201c17' },
      text: { primary: '#f5efe6', secondary: '#b0a392' },
      divider: '#332c24',
    },
  },
  {
    id: 'mono',
    label: 'Minimal',
    swatch: '#18181b',
    light: {
      primary: { main: '#18181b', light: '#52525b', dark: '#09090b', contrastText: '#ffffff' },
      background: { default: '#fafafa', paper: '#ffffff' },
      text: { primary: '#09090b', secondary: '#52525b' },
      divider: '#e4e4e7',
    },
    dark: {
      primary: { main: '#e4e4e7', light: '#fafafa', dark: '#a1a1aa', contrastText: '#09090b' },
      background: { default: '#09090b', paper: '#141417' },
      text: { primary: '#fafafa', secondary: '#a1a1aa' },
      divider: '#27272a',
    },
  },
]

export const THEME_FONTS: Record<ThemeFontId, { label: string; fontFamily: string }> = {
  sans: {
    label: 'Sans',
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
  },
  serif: {
    label: 'Serif',
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  mono: {
    label: 'Mono',
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
}

export const THEME_RADIUS_OPTIONS: Record<ThemeRadiusId, { label: string; borderRadius: number }> = {
  sharp: { label: 'Sharp', borderRadius: 4 },
  rounded: { label: 'Rounded', borderRadius: 8 },
  soft: { label: 'Soft', borderRadius: 14 },
}

export function getThemePreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0]
}
