import { createContext, useContext } from 'react'
import type {
  ThemeFontId,
  ThemePresetId,
  ThemeRadiusId,
} from '../config/themePresets'
import type { createAppTheme } from '../theme'

export interface ThemePresetContextValue {
  presetId: ThemePresetId
  setPresetId: (id: ThemePresetId) => void
  fontId: ThemeFontId
  setFontId: (id: ThemeFontId) => void
  radiusId: ThemeRadiusId
  setRadiusId: (id: ThemeRadiusId) => void
  theme: ReturnType<typeof createAppTheme>
}

export const ThemePresetContext = createContext<ThemePresetContextValue | null>(null)

export function useThemePreset(): ThemePresetContextValue {
  const ctx = useContext(ThemePresetContext)
  if (!ctx) {
    throw new Error('useThemePreset must be used inside ThemePresetProvider')
  }
  return ctx
}
