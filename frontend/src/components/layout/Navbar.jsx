import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'


export default function Navbar() {
  const { user, logout, accessToken } = useAuthStore();
  
  const [featOpen, setFeatOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass flex items-center justify-between px-12 py-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center font-display font-black text-white text-sm">T</div>
        <span className="font-display font-black text-xl tracking-tight text-white">
          Trackify<span className="text-cyan">AI</span>
        </span>
      </Link>

      {/* Nav links */}
      <ul className="hidden md:flex gap-8 list-none m-0 p-0">
        <li><Link to="/colleges" className="text-muted hover:text-white text-sm font-medium no-underline transition-colors">Colleges</Link></li>
        <li className="relative">
          <button onClick={() => setFeatOpen(o => !o)} className="text-muted hover:text-white text-sm font-medium bg-transparent border-none cursor-pointer transition-colors">
            Features ▾
          </button>
          {featOpen && (
            <div className="absolute top-8 left-0 card min-w-52 p-2 flex flex-col gap-1" onClick={() => setFeatOpen(false)}>
              {[
                ['📄 Resume Analyzer', '/resume-analyzer'],
                ['🎯 Career Quiz',      '/quiz'],
                ['📊 LeetCode Tracker', '/leetcode'],
                ['🗺️ AI Roadmap',       '/roadmap'],
                ['🌐 3D Career Tree',   '/career-tree'],
              ].map(([label, path]) => (
                <Link key={path} to={path} className="px-3 py-2 rounded-lg hover:bg-surface2 text-sm text-muted hover:text-white no-underline transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          )}
        </li>
        {accessToken && <li><Link to="/dashboard" className="text-muted hover:text-white text-sm font-medium no-underline transition-colors">Dashboard</Link></li>}
      </ul>


      {/* Actions */}
      <div className="flex items-center gap-3">
        {accessToken ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan/20 text-cyan text-sm font-semibold no-underline hover:bg-cyan/10 transition-colors">
              ⚙ Dashboard
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-white/10 text-muted text-sm font-medium bg-transparent cursor-pointer hover:text-white transition-colors">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm font-medium no-underline hover:bg-surface transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 rounded-lg gradient-btn text-white text-sm font-semibold no-underline transition-opacity hover:opacity-90">Get Started →</Link>
          </>
        )}
      </div>
    </nav>
  )
}