import { Link as RouterLink, NavLink, Outlet, useLocation } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

function AdminLayout() {
  const { pathname } = useLocation()
  const tab = pathname.startsWith('/admin/posts') ? 1 : 0

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
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
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  )
}

export default AdminLayout
