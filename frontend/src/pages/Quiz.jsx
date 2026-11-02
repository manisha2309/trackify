import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function Quiz() {
  const [current, setCurrent]   = useState(0)
  const [answers, setAnswers]   = useState([])
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: () => api.get('/career/quiz/questions').then(r => r.data),
    retry: 1,
  })

  const submitMutation = useMutation({
    mutationFn: (ans) => api.post('/career/quiz/submit', { answers: ans }).then(r => r.data),
    onSuccess: async (result) => {
      const user = useAuthStore.getState().user
      if (user) {
        try {
          await api.put('/profile/me/quiz', {
            careerMatch: result.topCareer,
            matchPercentage: result.matchPercentage,
          })
          useAuthStore.getState().updateUser({
            careerMatch: result.topCareer,
            careerMatchPct: result.matchPercentage,
            quizCompleted: true,
          })
        } catch {
          toast.error('Result not saved')
        }
      }
      navigate('/quiz/result', { state: { result } })
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Submission failed'),
  })

  const questions = data?.questions || []
  const total     = data?.total || 8
  const q         = questions[current]
  const progress  = (current / total) * 100

  const handleNext = () => {
    if (selected === null) return toast.error('Please select an answer')
    const newAnswers = [...answers, selected]
    if (current < total - 1) {
      setAnswers(newAnswers)
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      submitMutation.mutate(newAnswers)
    }
  }

  const handlePrev = () => {
    if (current === 0) return
    setCurrent(c => c - 1)
    setSelected(answers[current - 1] ?? null)
    setAnswers(a => a.slice(0, -1))
  }

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
      <div className="text-muted text-sm">Loading quiz questions...</div>
    </div>
  )

  // ── Error ────────────────────────────────────────────────
  if (isError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <div className="text-5xl">⚠️</div>
      <h2 className="font-display font-bold text-2xl text-white">Could not load quiz</h2>
      <p className="text-muted text-sm text-center max-w-sm">
        {error?.response?.data?.error || 'Career service may be offline. Make sure it is running on port 4002.'}
      </p>
      <code className="text-xs text-faint bg-surface px-4 py-2 rounded-lg">
        GET /api/career/quiz/questions
      </code>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-xl gradient-btn text-white font-bold text-sm border-none cursor-pointer"
      >
        Try Again
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20 pb-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl text-white mb-1">
            Career Discovery Quiz
          </h1>
          <p className="text-muted text-sm">
            Question {current + 1} of {total}&nbsp;&nbsp;·&nbsp;&nbsp;
            <span className="text-cyan font-semibold">
              {Math.round(((current ) / total) * 100)}% Complete
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-surface2 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00d4ff, #ff2d9f)',
            }}
          />
        </div>

        {/* Question card */}
        {q ? (
          <div className="card p-8">
            <h2 className="font-bold text-xl text-white mb-6 leading-snug">
              {q.question}
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="text-left px-5 py-4 rounded-xl border text-sm transition-all cursor-pointer font-medium"
                  style={{
                    background:  selected === i ? 'rgba(0,212,255,0.08)' : '#1a2540',
                    borderColor: selected === i ? '#00d4ff' : 'rgba(99,179,255,0.12)',
                    color:       selected === i ? '#00d4ff' : '#7a8aa8',
                  }}
                >
                  <span className="inline-block w-5 h-5 rounded-full border mr-3 align-middle flex-shrink-0"
                    style={{
                      borderColor: selected === i ? '#00d4ff' : '#3a4a65',
                      background:  selected === i ? '#00d4ff' : 'transparent',
                    }}
                  />
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={current === 0}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-muted text-sm font-medium bg-transparent cursor-pointer hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <span className="text-xs text-faint">
                {current + 1} / {total}
              </span>

              <button
                onClick={handleNext}
                disabled={submitMutation.isPending}
                className="px-8 py-2.5 rounded-xl gradient-btn-pink text-white font-bold text-sm border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {current === total - 1
                  ? (submitMutation.isPending ? '⏳ Analysing...' : '🎯 Get My Results →')
                  : 'Next →'}
              </button>
            </div>
          </div>
        ) : (
          // No question loaded but no error — service returned empty array
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">🤔</div>
            <p className="text-muted">No questions found. Check career-service is running.</p>
          </div>
        )}

        <p className="text-center text-faint text-xs mt-6">
          ← <a href="/dashboard" className="hover:text-muted transition-colors no-underline">Back to Dashboard</a>
        </p>
      </div>
    </div>
  )
}