import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Roadmap() {
  const [career, setCareer]     = useState('')
  const [level, setLevel]       = useState('beginner')
  const [roadmap, setRoadmap]   = useState(null)

  useEffect(() => {
    api.get('/roadmap/mine')
      .then(r => {
        if (r.data) setRoadmap(r.data)
      })
      .catch(err => {
        if (err?.response?.status !== 404) {
          console.error('Failed to load roadmap:', err)
        }
      })
  }, [])

  const generate = useMutation({
    mutationFn: () => api.post('/roadmap/generate', { career, currentLevel: level }).then(r => r.data),
    onSuccess: (data) => { setRoadmap(data); toast.success('Roadmap generated!') },
    onError: () => toast.error('Generation failed'),
  })

  const toggleStep = async (phaseIndex, stepIndex) => {
    if (!roadmap) return
    const step = roadmap.phases[phaseIndex].steps[stepIndex]
    try {
      const { data } = await api.patch(`/roadmap/${roadmap.id}/step`, {
        phaseIndex, stepIndex, completed: !step.completed
      })
      setRoadmap(data)
    } catch { toast.error('Update failed') }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
      <div className="mb-10">
        <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-2">AI Generator</p>
        <h1 className="font-display font-black text-5xl tracking-tight text-white mb-2">
          Your <span className="gradient-text">Career Roadmap</span>
        </h1>
        <p className="text-muted">AI-generated, step-by-step personalized learning plan</p>
      </div>

      {/* Generator form */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Career Goal</label>
            <input value={career} onChange={e => setCareer(e.target.value)}
              placeholder="e.g. Software Developer, UI/UX Designer"
              className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white placeholder-faint text-sm outline-none focus:border-cyan/50 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white text-sm outline-none focus:border-cyan/50 transition-colors">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <button onClick={() => generate.mutate()} disabled={!career || generate.isPending}
          className="px-6 py-3 rounded-xl gradient-btn-pink text-white font-bold text-sm border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
          {generate.isPending ? '⚡ Generating with AI...' : '⚡ Generate AI Roadmap'}
        </button>
      </div>

      {/* Roadmap display */}
      {roadmap && (
        <div className="card p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">{roadmap.title}</h2>
              <p className="text-muted text-sm mt-1">{roadmap.description} · ~{roadmap.estimatedMonths} months</p>
            </div>
            <div className="text-right">
              <div className="font-display font-black text-2xl text-cyan">{roadmap.progress}%</div>
              <div className="text-xs text-muted">complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-surface2 rounded-full mb-8 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${roadmap.progress}%`, background: 'linear-gradient(90deg,#00d4ff,#10d87b)' }} />
          </div>

          {roadmap.phases.map((phase, pi) => (
            <div key={pi} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full gradient-btn flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{phase.phase}</div>
                <div>
                  <h3 className="font-bold text-white text-base">{phase.title}</h3>
                  <span className="text-xs text-muted">{phase.duration}</span>
                </div>
              </div>
              <div className="ml-10 flex flex-col gap-3">
                {phase.steps.map((step, si) => (
                  <div key={si} onClick={() => toggleStep(pi, si)}
                    className="card p-4 cursor-pointer hover:border-cyan/25 transition-all flex items-start gap-3"
                    style={{ borderColor: step.completed ? 'rgba(16,216,123,0.3)' : undefined, background: step.completed ? 'rgba(16,216,123,0.04)' : undefined }}>
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                      style={{ borderColor: step.completed ? '#10d87b' : '#3a4a65', background: step.completed ? '#10d87b' : 'transparent' }}>
                      {step.completed && <span className="text-bg text-xs font-bold">✓</span>}
                    </div>
                    <div>
                      <div className={`font-semibold text-sm ${step.completed ? 'line-through text-faint' : 'text-white'}`}>{step.title}</div>
                      <div className="text-xs text-muted mt-0.5">{step.description}</div>
                      {step.resources?.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {step.resources.map(r => (
                            <span key={r} className="text-xs px-2 py-0.5 rounded bg-surface2 text-faint border border-white/5">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}