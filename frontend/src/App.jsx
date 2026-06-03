import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/layout/Navbar'

import ResumeAnalyzer from './pages/ResumeAnalyzer'
import Home        from './pages/Home'
import Login       from './pages/Login'
import Register    from './pages/Register'
import Dashboard   from './pages/Dashboard'
import Quiz        from './pages/Quiz'
import QuizResult  from './pages/QuizResult'
import Colleges    from './pages/Colleges'
import Roadmap     from './pages/Roadmap'
import LeetCode    from './pages/Leetcode'
import CareerTree  from './pages/CareerTree'
import Profile     from './pages/Profile'

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(s => s.accessToken)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/colleges"   element={<Colleges />} />

        {/* Protected */}
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/quiz"       element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/quiz/result" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
        <Route path="/roadmap"    element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/leetcode"   element={<ProtectedRoute><LeetCode /></ProtectedRoute>} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/career-tree" element={<ProtectedRoute><CareerTree /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}