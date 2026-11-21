import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Navigate, Route, Routes } from 'react-router'
import GlobalQuerySnackbar from './components/GlobalQuerySnackbar'
import AdminLayout from './layouts/AdminLayout'
import BlogDetailPage from './pages/BlogDetailPage'
import BlogListPage from './pages/BlogListPage'
import NoteViewPage from './pages/admin/NoteViewPage'
import DashboardPage from './pages/admin/DashboardPage'
import LoginPage from './pages/admin/LoginPage'
import MediaPage from './pages/admin/MediaPage'
import NoteEditorPage from './pages/admin/NoteEditorPage'
import NotesEmptyPane from './pages/admin/notes/NotesEmptyPane'
import NotesWorkspace from './pages/admin/notes/NotesWorkspace'
import PostEditorPage from './pages/admin/PostEditorPage'
import PostsPage from './pages/admin/PostsPage'
import { theme } from './theme'


function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/blog" replace />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/new" element={<PostEditorPage />} />
          <Route path="posts/:id/edit" element={<PostEditorPage />} />
          <Route path="notes" element={<NotesWorkspace />}>
            <Route index element={<NotesEmptyPane />} />
            <Route path="all" element={<NotesEmptyPane />} />
            <Route path="favorites" element={<NotesEmptyPane />} />
            <Route path="recent" element={<NotesEmptyPane />} />
            <Route path="archive" element={<NotesEmptyPane />} />
            <Route path="unfiled" element={<NotesEmptyPane />} />
            <Route path="notebooks" element={<NotesEmptyPane />} />
            <Route path="notebooks/:notebookId" element={<NotesEmptyPane />} />
            <Route path="new" element={<NoteEditorPage />} />
            <Route path=":id" element={<NoteViewPage />} />
            <Route path=":id/edit" element={<NoteEditorPage />} />
          </Route>
          <Route path="media" element={<MediaPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/blog" replace />} />
      </Routes>
      <GlobalQuerySnackbar />
    </ThemeProvider>
  )
}

export default App
