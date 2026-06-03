import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center font-display font-black text-white text-2xl mx-auto mb-4">N</div>
          <h1 className="font-display font-black text-3xl text-white">Welcome Back</h1>
          <p className="text-muted text-sm mt-1">Sign in to continue your career journey</p>
        </div>

        <div className="card p-8" style={{ boxShadow: '0 0 60px rgba(0,212,255,0.08)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white placeholder-faint text-sm outline-none focus:border-cyan/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white placeholder-faint text-sm outline-none focus:border-cyan/50 transition-colors pr-12"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted bg-transparent border-none cursor-pointer text-sm">
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="text-right mt-1">
                <a href="#" className="text-cyan text-xs font-semibold no-underline hover:underline">Forgot password?</a>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-xl gradient-btn-pink text-white font-bold text-sm cursor-pointer border-none mt-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              {isLoading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan font-semibold no-underline hover:underline">Sign up now</Link>
          </p>
        </div>
      </div>
    </div>
  )
}