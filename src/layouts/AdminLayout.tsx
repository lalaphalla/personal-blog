import { useEffect, useState } from 'react'
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
  ExpensesIcon,
  FileTextIcon,
  GoalsIcon,
  HabitsIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MindmapIcon,
  NewspaperIcon,
  ReaderIcon,
  RecallIcon,
  TasksIcon,
} from '../components/DocIcons'
import SearchIcon from '@mui/icons-material/Search'
import { getMe, logout } from '../services/authApi'
import CommandPalette from '../components/CommandPalette'
import ThemeToggleButton from '../components/ThemeToggleButton'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboardIcon />, end: true },
  { label: 'Posts', to: '/admin/posts', icon: <NewspaperIcon />, end: false },
  { label: 'Notes', to: '/admin/notes', icon: <FileTextIcon />, end: false },
  { label: 'Journal', to: '/admin/journal', icon: <BookOpenIcon />, end: false },
  { label: 'Mindmaps', to: '/admin/mindmaps', icon: <MindmapIcon />, end: false },
  { label: 'Recall', to: '/admin/recall', icon: <RecallIcon />, end: false },
  { label: 'Reader', to: '/admin/reader', icon: <ReaderIcon />, end: false },
  { label: 'Tasks', to: '/admin/tasks', icon: <TasksIcon />, end: false },
  { label: 'Habits', to: '/admin/habits', icon: <HabitsIcon />, end: false },
  { label: 'Goals', to: '/admin/goals', icon: <GoalsIcon />, end: false },
  { label: 'Expenses', to: '/admin/expenses', icon: <ExpensesIcon />, end: false },
  { label: 'Media', to: '/admin/media', icon: <ImageIcon />, end: false },
]

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [navOpen, setNavOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

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
              : pathname.startsWith('/admin/tasks')
                ? 7
                : pathname.startsWith('/admin/habits')
                  ? 8
                  : pathname.startsWith('/admin/goals')
                    ? 9
                    : pathname.startsWith('/admin/expenses')
                      ? 10
                      : pathname.startsWith('/admin/media')
                        ? 11
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
            Muni
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
            <Tab label="Tasks" component={NavLink} to="/admin/tasks" />
            <Tab label="Habits" component={NavLink} to="/admin/habits" />
            <Tab label="Goals" component={NavLink} to="/admin/goals" />
            <Tab label="Expenses" component={NavLink} to="/admin/expenses" />
            <Tab label="Media" component={NavLink} to="/admin/media" />
          </Tabs>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<SearchIcon fontSize="small" />}
            onClick={() => setCmdOpen(true)}
            aria-label="Open command palette"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              borderColor: 'divider',
              color: 'text.secondary',
              textTransform: 'none',
              px: 1.25,
              mr: 0.5,
            }}
          >
            ⌘K
          </Button>
          <IconButton
            color="inherit"
            aria-label="Open command palette"
            onClick={() => setCmdOpen(true)}
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
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
              M
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                Muni
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
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </Box>
  )
}

export default AdminLayout
