import type { ReactNode } from 'react'
import { Link as RouterLink, NavLink } from 'react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import {
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  PlusIcon,
  QuoteIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
  TrashIcon,
} from '../DocIcons'

interface NavItem {
  label: string
  to: string
  icon: ReactNode
  end?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Today', to: '/admin/journal', icon: <SunIcon />, end: true },
  { label: 'Calendar', to: '/admin/journal/calendar', icon: <CalendarIcon /> },
  { label: 'Timeline', to: '/admin/journal/timeline', icon: <ClockIcon /> },
  { label: 'Favorites', to: '/admin/journal/favorites', icon: <HeartIcon /> },
  { label: 'Memories', to: '/admin/journal/memories', icon: <SparklesIcon /> },
  { label: 'Quotes', to: '/admin/journal/quotes', icon: <QuoteIcon /> },
  { label: 'Search', to: '/admin/journal/search', icon: <SearchIcon /> },
]

export default function JournalSidebar() {
  const theme = useTheme()

  return (
    <Box
      component="nav"
      aria-label="Journal"
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        height: '100%',
        p: 2,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: 1.2,
            color: 'text.secondary',
            px: 1,
            display: 'block',
          }}
        >
          Journal
        </Typography>
        <Button
          component={RouterLink}
          to="/admin/journal/new"
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<PlusIcon />}
          sx={{
            mt: 1,
            py: 1,
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          New Entry
        </Button>
      </Box>

      <List disablePadding sx={{ flexGrow: 1 }}>
        {PRIMARY_NAV.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              py: 0.85,
              px: 1.5,
              color: 'text.secondary',
              '&.active': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                fontWeight: 600,
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 'inherit' } } }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1.5 }} />

      <List disablePadding>
        <ListItemButton
          component={NavLink}
          to="/admin/journal/trash"
          sx={{
            borderRadius: 1.5,
            py: 0.85,
            px: 1.5,
            color: 'text.secondary',
            '&.active': {
              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.08),
              fontWeight: 600,
              '& .MuiListItemIcon-root': {
                color: 'error.main',
              },
            },
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <TrashIcon />
          </ListItemIcon>
          <ListItemText
            primary="Recently Deleted"
            slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: 'inherit' } } }}
          />
        </ListItemButton>
      </List>
    </Box>
  )
}
