import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import {
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  SunIcon,
} from '../DocIcons'

interface MobileTab {
  label: string
  to: string
  icon: ReactNode
  end?: boolean
}

const TABS: MobileTab[] = [
  { label: 'Today', to: '/admin/journal', icon: <SunIcon />, end: true },
  { label: 'Calendar', to: '/admin/journal/calendar', icon: <CalendarIcon /> },
  { label: 'Timeline', to: '/admin/journal/timeline', icon: <ClockIcon /> },
  { label: 'Memories', to: '/admin/journal/memories', icon: <SparklesIcon /> },
]

export default function MobileBottomNav() {
  const theme = useTheme()
  const location = useLocation()

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: 'block', md: 'none' },
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        pb: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <Stack
        direction="row"
        sx={{
          height: 56,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.end
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to)

          return (
            <Box
              key={tab.to}
              component={NavLink}
              to={tab.to}
              sx={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                color: isActive ? 'primary.main' : 'text.secondary',
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: isActive ? 600 : 400 }}>
                {tab.label}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Paper>
  )
}
