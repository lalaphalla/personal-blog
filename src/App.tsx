import { Navigate, Route, Routes } from 'react-router'
import BlogListPage from './pages/BlogListPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/blog" replace />} />
      <Route path="/blog" element={<BlogListPage />} />
      <Route path="*" element={<Navigate to="/blog" replace />} />
    </Routes>
  )
}

export default App
