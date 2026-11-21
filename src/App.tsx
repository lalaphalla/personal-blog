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
import JournalCalendarPage from './pages/admin/journal/JournalCalendarPage'
import JournalDayPage from './pages/admin/journal/JournalDayPage'
import JournalDetailPage from './pages/admin/journal/JournalDetailPage'
import JournalEditorPage from './pages/admin/journal/JournalEditorPage'
import JournalFavoritesPage from './pages/admin/journal/JournalFavoritesPage'
import JournalLayout from './pages/admin/journal/JournalLayout'
import JournalMemoriesPage from './pages/admin/journal/JournalMemoriesPage'
import JournalSearchPage from './pages/admin/journal/JournalSearchPage'
import JournalTodayPage from './pages/admin/journal/JournalTodayPage'
import JournalTimelinePage from './pages/admin/journal/JournalTimelinePage'
import JournalTrashPage from './pages/admin/journal/JournalTrashPage'
import QuotesPage from './pages/admin/journal/QuotesPage'
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
          <Route path="journal" element={<JournalLayout />}>
            <Route index element={<JournalTodayPage />} />
            <Route path="new" element={<JournalEditorPage />} />
            <Route path="calendar" element={<JournalCalendarPage />} />
            <Route path="day/:date" element={<JournalDayPage />} />
            <Route path="timeline" element={<JournalTimelinePage />} />
            <Route path="favorites" element={<JournalFavoritesPage />} />
            <Route path="memories" element={<JournalMemoriesPage />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="search" element={<JournalSearchPage />} />
            <Route path="trash" element={<JournalTrashPage />} />
            <Route path=":id" element={<JournalDetailPage />} />
            <Route path=":id/edit" element={<JournalEditorPage />} />
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
