import { Outlet, useLocation } from 'react-router'
import Box from '@mui/material/Box'
import JournalSidebar from '../../../components/journal/JournalSidebar'
import MobileBottomNav from '../../../components/journal/MobileBottomNav'

export default function JournalLayout() {
  const location = useLocation()
  const isEditor = location.pathname.includes('/new') || location.pathname.includes('/edit')

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)', // Deduct AdminLayout AppBar
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Desktop Sidebar (hidden on mobile) */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }}>
        <JournalSidebar />
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pb: { xs: isEditor ? 2 : 10, md: 6 },
          pt: { xs: 2, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: isEditor ? 860 : 780,
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Bottom Nav (hidden on desktop and editor routes to save space) */}
      {!isEditor && <MobileBottomNav />}
    </Box>
  )
}
