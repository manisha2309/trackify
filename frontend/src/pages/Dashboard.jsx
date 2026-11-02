import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const QUICK_LINKS = [
  { icon: '🎯', label: 'Career Quiz',        to: '/quiz',        color: '#00d4ff' },
  { icon: '📊', label: 'LeetCode Tracker',   to: '/leetcode',    color: '#ffb020' },
  { icon: '🗺️', label: 'AI Roadmap',         to: '/roadmap',     color: '#10d87b' },
  { icon: '🏛️', label: 'College Finder',     to: '/colleges',    color: '#ff2d9f' },
  { icon: '🌐', label: '3D Career Tree',      to: '/career-tree', color: '#7c3aed' },
  { icon: '👤', label: 'My Profile',          to: '/profile',     color: '#7a8aa8' },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
      {/* Welcome */}
      <div className="mb-10">
        <p className="text-muted text-sm mb-1">Welcome back,</p>
        <h1 className="font-display font-black text-5xl tracking-tight text-white">
          {user?.name?.split(' ')[0]} <span className="gradient-text">👋</span>
        </h1>
        <p className="text-muted mt-2">Here's your career intelligence overview.</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="card p-6">
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">Plan</div>
          <div className="font-display font-bold text-xl text-white capitalize">{user?.plan || 'free'}</div>
          <Link to="/pricing" className="text-cyan text-xs no-underline hover:underline mt-1 block">Upgrade →</Link>
        </div>
        <div className="card p-6">
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">Career Match</div>
          <div className="font-display font-bold text-xl text-white">
            {user?.careerMatch
              ? `${user.careerMatch}${user.careerMatchPct ? `, ${user.careerMatchPct}% match` : ''}`
              : 'Not yet taken'}
          </div>
          {!user?.careerMatch && <Link to="/quiz" className="text-cyan text-xs no-underline hover:underline mt-1 block">Take quiz →</Link>}
        </div>
        <div className="card p-6">
          <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">LeetCode</div>
          <div className="font-display font-bold text-xl text-white">{user?.leetcodeUsername || 'Not connected'}</div>
          <Link to="/leetcode" className="text-cyan text-xs no-underline hover:underline mt-1 block">
            {user?.leetcodeUsername ? 'View stats →' : 'Connect →'}
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="font-display font-bold text-2xl text-white mb-5">Quick Access</h2>
      <div className="grid grid-cols-3 gap-4">
        {QUICK_LINKS.map(({ icon, label, to, color }) => (
          <Link key={to} to={to} className="card card-hover p-6 flex items-center gap-4 no-underline group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${color}15` }}>{icon}</div>
            <span className="font-semibold text-white group-hover:text-cyan transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}