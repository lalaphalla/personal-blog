import { Link as RouterLink, NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { getMe, logout } from '../services/authApi'

function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    onError: () => {}, // handled by onSettled redirect; errors are global via cache
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
  const tab = pathname.startsWith('/admin/posts') ? 1 : 0

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 3 }}>
            Blog Admin
          </Typography>
          <Tabs value={tab} sx={{ flexGrow: 1 }}>
            <Tab label="Dashboard" component={NavLink} to="/admin" />
            <Tab label="Posts" component={NavLink} to="/admin/posts" />
          </Tabs>
          <Button component={RouterLink} to="/blog" size="small">
            View blog →
          </Button>
          <Button size="small" onClick={() => logoutMutation.mutate()} sx={{ ml: 1 }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}

export default AdminLayout
