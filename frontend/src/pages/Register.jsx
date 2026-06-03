import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome to TrackifyAI 🎉')
      navigate('/quiz')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center font-display font-black text-white text-2xl mx-auto mb-4">N</div>
          <h1 className="font-display font-black text-3xl text-white">Create Account</h1>
          <p className="text-muted text-sm mt-1">Start your personalized career journey</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { key: 'name',     label: 'Full Name',      type: 'text',     placeholder: 'Arjun Sharma' },
              { key: 'email',    label: 'Email Address',  type: 'email',    placeholder: 'you@example.com' },
              { key: 'password', label: 'Password',       type: 'password', placeholder: 'Min. 6 characters' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">{label}</label>
                <input
                  type={type} required
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white placeholder-faint text-sm outline-none focus:border-cyan/50 transition-colors"
                />
              </div>
            ))}

            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-xl gradient-btn-pink text-white font-bold text-sm cursor-pointer border-none mt-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              {isLoading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan font-semibold no-underline hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}