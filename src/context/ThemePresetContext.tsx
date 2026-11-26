import { useMemo, useState, type ReactNode } from 'react'
import {
  THEME_FONTS,
  THEME_PRESETS,
  THEME_RADIUS_OPTIONS,
  type ThemeFontId,
  type ThemePresetId,
  type ThemeRadiusId,
} from '../config/themePresets'
import { ThemePresetContext } from '../hooks/useThemePreset'
import { createAppTheme } from '../theme'

const PRESET_KEY = 'blog-theme-preset'
const FONT_KEY = 'blog-theme-font'
const RADIUS_KEY = 'blog-theme-radius'

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const val = window.localStorage.getItem(key) as T | null
    return val && allowed.includes(val) ? val : fallback
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore storage errors
  }
}

const PRESET_IDS = THEME_PRESETS.map((p) => p.id)
const FONT_IDS = Object.keys(THEME_FONTS) as ThemeFontId[]
const RADIUS_IDS = Object.keys(THEME_RADIUS_OPTIONS) as ThemeRadiusId[]

export function ThemePresetProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetState] = useState<ThemePresetId>(() =>
    readStored(PRESET_KEY, PRESET_IDS, 'violet'),
  )
  const [fontId, setFontState] = useState<ThemeFontId>(() =>
    readStored(FONT_KEY, FONT_IDS, 'sans'),
  )
  const [radiusId, setRadiusState] = useState<ThemeRadiusId>(() =>
    readStored(RADIUS_KEY, RADIUS_IDS, 'rounded'),
  )

  const setPresetId = (id: ThemePresetId) => {
    setPresetState(id)
    writeStored(PRESET_KEY, id)
  }

  const setFontId = (id: ThemeFontId) => {
    setFontState(id)
    writeStored(FONT_KEY, id)
  }

  const setRadiusId = (id: ThemeRadiusId) => {
    setRadiusState(id)
    writeStored(RADIUS_KEY, id)
  }

  const theme = useMemo(
    () => createAppTheme(presetId, fontId, radiusId),
    [presetId, fontId, radiusId],
  )

  return (
    <ThemePresetContext.Provider
      value={{ presetId, setPresetId, fontId, setFontId, radiusId, setRadiusId, theme }}
    >
      {children}
    </ThemePresetContext.Provider>
  )
}
