import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import { MoonIcon, SunIcon } from './DocIcons'

export default function ThemeToggleButton() {
  const { mode, systemMode, setMode } = useColorScheme()
  const effectiveMode = mode === 'system' ? systemMode : mode
  const isDark = effectiveMode === 'dark'

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        size="small"
        color="inherit"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setMode(isDark ? 'light' : 'dark')}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  )
}
