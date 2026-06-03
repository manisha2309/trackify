import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', language: user?.language || 'en', leetcodeUsername: user?.leetcodeUsername || '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/profile/me', form)
      updateUser(data)
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' }, { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' }, { code: 'ks', label: 'کٲشُر' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
      <div className="mb-10">
        <h1 className="font-display font-black text-4xl text-white mb-1">My Profile</h1>
        <p className="text-muted">Manage your account settings</p>
      </div>

      <div className="card p-8 flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-btn-pink flex items-center justify-center font-display font-black text-white text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-white">{user?.name}</div>
            <div className="text-muted text-sm">{user?.email}</div>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20 font-bold capitalize mt-1 inline-block">{user?.plan} plan</span>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Form fields */}
        {[
          { key: 'name',              label: 'Full Name',           type: 'text',   placeholder: 'Your name' },
          { key: 'leetcodeUsername',  label: 'LeetCode Username',   type: 'text',   placeholder: 'e.g. binarybrosfx' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white placeholder-faint text-sm outline-none focus:border-cyan/50 transition-colors" />
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Preferred Language</label>
          <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white text-sm outline-none focus:border-cyan/50 transition-colors">
            {LANGUAGES.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
          </select>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 rounded-xl gradient-btn text-white font-bold text-sm border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 self-start">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}