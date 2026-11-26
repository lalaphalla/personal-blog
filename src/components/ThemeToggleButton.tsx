import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useColorScheme } from '@mui/material/styles'
import {
  THEME_FONTS,
  THEME_PRESETS,
  THEME_RADIUS_OPTIONS,
  type ThemeFontId,
  type ThemeRadiusId,
} from '../config/themePresets'
import { useThemePreset } from '../hooks/useThemePreset'
import { MoonIcon, SunIcon } from './DocIcons'

export default function ThemeToggleButton() {
  const { mode, systemMode, setMode } = useColorScheme()
  const { presetId, setPresetId, fontId, setFontId, radiusId, setRadiusId } = useThemePreset()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const effectiveMode = mode === 'system' ? systemMode : mode
  const isDark = effectiveMode === 'dark'

  return (
    <>
      <Tooltip title="Theme & Style">
        <IconButton
          size="small"
          color="inherit"
          aria-label="Theme & Style"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 280, p: 2, borderRadius: 2.5, mt: 0.75 },
          },
        }}
      >
        <Stack spacing={2}>
          {/* Mode */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              MODE
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
              {(
                [
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'system', label: 'Auto' },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.id}
                  size="small"
                  variant={(mode ?? 'light') === opt.id ? 'contained' : 'outlined'}
                  onClick={() => setMode(opt.id)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {opt.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Color Preset */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              COLOR THEME
            </Typography>
            <Stack spacing={0.75}>
              {THEME_PRESETS.map((preset) => {
                const active = presetId === preset.id
                return (
                  <Button
                    key={preset.id}
                    size="small"
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setPresetId(preset.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      gap: 1.25,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: preset.swatch,
                        border: '2px solid rgba(255,255,255,0.8)',
                        flexShrink: 0,
                      }}
                    />
                    {preset.label}
                  </Button>
                )
              })}
            </Stack>
          </Box>

          <Divider />

          {/* Typography */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              FONT STYLE
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
              {(Object.keys(THEME_FONTS) as ThemeFontId[]).map((key) => (
                <Button
                  key={key}
                  size="small"
                  variant={fontId === key ? 'contained' : 'outlined'}
                  onClick={() => setFontId(key)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {THEME_FONTS[key].label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Corner Radius */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              CORNERS
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
              {(Object.keys(THEME_RADIUS_OPTIONS) as ThemeRadiusId[]).map((key) => (
                <Button
                  key={key}
                  size="small"
                  variant={radiusId === key ? 'contained' : 'outlined'}
                  onClick={() => setRadiusId(key)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {THEME_RADIUS_OPTIONS[key].label}
                </Button>
              ))}
            </Box>
          </Box>
        </Stack>
      </Popover>
    </>
  )
}
