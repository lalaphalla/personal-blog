import { useState } from 'react'
import { Link as RouterLink, NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import {
  BookOpenIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MindmapIcon,
  NewspaperIcon,
  ReaderIcon,
  RecallIcon,
} from '../components/DocIcons'
import { getMe, logout } from '../services/authApi'
import ThemeToggleButton from '../components/ThemeToggleButton'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboardIcon />, end: true },
  { label: 'Posts', to: '/admin/posts', icon: <NewspaperIcon />, end: false },
  { label: 'Notes', to: '/admin/notes', icon: <FileTextIcon />, end: false },
  { label: 'Journal', to: '/admin/journal', icon: <BookOpenIcon />, end: false },
  { label: 'Mindmaps', to: '/admin/mindmaps', icon: <MindmapIcon />, end: false },
  { label: 'Recall', to: '/admin/recall', icon: <RecallIcon />, end: false },
  { label: 'Reader', to: '/admin/reader', icon: <ReaderIcon />, end: false },
  { label: 'Media', to: '/admin/media', icon: <ImageIcon />, end: false },
]

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [navOpen, setNavOpen] = useState(false)

  const { data: user, isPending, isError } = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60_000,
    meta: { suppressGlobalError: true },
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['admin', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      navigate('/admin/login', { replace: true })
    },
    onError: () => { }, // handled by onSettled redirect; errors are global via cache
    meta: { suppressGlobalError: true },
  })

  if (isPending) {
    return (
      <Stack sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  const { pathname } = location
  const isNotesRoute = pathname.startsWith('/admin/notes')
  const isJournalRoute = pathname.startsWith('/admin/journal')
  const isMindmapRoute = pathname.startsWith('/admin/mindmaps')
  const isFullBleed = isNotesRoute || isJournalRoute || isMindmapRoute
  const tab = pathname.startsWith('/admin/posts')
    ? 1
    : pathname.startsWith('/admin/notes')
      ? 2
      : pathname.startsWith('/admin/journal')
        ? 3
        : pathname.startsWith('/admin/mindmaps')
          ? 4
          : pathname.startsWith('/admin/recall')
            ? 5
            : pathname.startsWith('/admin/reader')
              ? 6
              : pathname.startsWith('/admin/media')
                ? 7
                : 0

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open navigation menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
            sx={{ display: { md: 'none' }, ml: -0.5 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: { md: 3 },
              flexGrow: { xs: 1, md: 0 },
              fontSize: { xs: '1.05rem', md: '1.25rem' },
            }}
          >
            Admin
          </Typography>
          <Tabs
            value={tab}
            sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}
            aria-label="Admin sections"
          >
            <Tab label="Dashboard" component={NavLink} to="/admin" end />
            <Tab label="Posts" component={NavLink} to="/admin/posts" />
            <Tab label="Notes" component={NavLink} to="/admin/notes" />
            <Tab label="Journal" component={NavLink} to="/admin/journal" />
            <Tab label="Mindmaps" component={NavLink} to="/admin/mindmaps" />
            <Tab label="Recall" component={NavLink} to="/admin/recall" />
            <Tab label="Reader" component={NavLink} to="/admin/reader" />
            <Tab label="Media" component={NavLink} to="/admin/media" />
          </Tabs>
          <ThemeToggleButton />
          <Button
            component={RouterLink}
            to="/blog"
            size="small"
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            View blog →
          </Button>
          <Button
            size="small"
            onClick={() => logoutMutation.mutate()}
            sx={{ display: { xs: 'none', md: 'inline-flex' }, ml: 1 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={navOpen}
        onClose={() => setNavOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              maxWidth: '85vw',
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 2.5, py: 2.25 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              B
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                Admin
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.username}
              </Typography>
            </Box>
          </Stack>
          <Divider />
          <List sx={{ px: 1, py: 1.5 }}>
            {NAV_ITEMS.map((item, index) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                selected={tab === index}
                onClick={() => setNavOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14) },
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ flex: 1 }} />
          <Divider />
          <List sx={{ px: 1, py: 1 }}>
            <ListItemButton
              component={RouterLink}
              to="/blog"
              onClick={() => setNavOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                <ExternalLinkIcon />
              </ListItemIcon>
              <ListItemText primary="View blog" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                setNavOpen(false)
                logoutMutation.mutate()
              }}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                <LogOutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Container
        component="main"
        maxWidth={isFullBleed ? false : 'lg'}
        disableGutters={isFullBleed}
        sx={{
          py: isFullBleed ? 0 : { xs: 2.5, md: 4 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  )
}

export default AdminLayout
