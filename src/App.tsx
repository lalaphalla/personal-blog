import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Navigate, Route, Routes } from 'react-router'
import GlobalQuerySnackbar from './components/GlobalQuerySnackbar'
import AdminLayout from './layouts/AdminLayout'
import BlogDetailPage from './pages/BlogDetailPage'
import BlogListPage from './pages/BlogListPage'
import DashboardPage from './pages/admin/DashboardPage'
import PostEditorPage from './pages/admin/PostEditorPage'
import PostsPage from './pages/admin/PostsPage'
import { theme } from './theme'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/blog" replace />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/new" element={<PostEditorPage />} />
          <Route path="posts/:id/edit" element={<PostEditorPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/blog" replace />} />
      </Routes>
      <GlobalQuerySnackbar />
    </ThemeProvider>
  )
}

export default App
