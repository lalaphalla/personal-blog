import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Navigate, Route, Routes } from 'react-router'
import BlogListPage from './pages/BlogListPage'
import { theme } from './theme'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/blog" replace />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="*" element={<Navigate to="/blog" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
