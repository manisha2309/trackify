// QuizResult.jsx
import { useLocation, Link } from 'react-router-dom'

export default function QuizResult() {
  const { state } = useLocation()
  const result = state?.result

  if (!result) return <div className="min-h-screen flex items-center justify-center text-muted">No result data. <Link to="/quiz" className="text-cyan ml-2">Retake quiz</Link></div>

  return (
    <div className="max-w-4xl mx-auto px-6 pt-28 pb-16 text-center">
      <div className="w-20 h-20 rounded-full gradient-btn-pink flex items-center justify-center text-4xl mx-auto mb-6">🎯</div>
      <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-2">Your Perfect Match</p>
      <h1 className="font-display font-black text-6xl tracking-tight text-white mb-2">{result.topCareer}</h1>
      <div className="text-2xl font-bold mb-8" style={{ color: '#10d87b' }}>⭐ {result.matchPercentage}% Match Score</div>

      {result.aiInsight && (
        <div className="card p-6 mb-8 text-left max-w-2xl mx-auto">
          <p className="text-xs font-bold text-cyan uppercase tracking-wider mb-2">AI Insight</p>
          <p className="text-muted text-sm leading-relaxed">{result.aiInsight}</p>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4 mb-10 max-w-2xl mx-auto">
        {result.allMatches?.map(({ career, matchPercentage }) => (
          <div key={career} className="card p-4 text-center">
            <div className="font-bold text-lg text-cyan mb-1">{matchPercentage}%</div>
            <div className="text-xs text-muted leading-tight">{career}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/roadmap" className="px-8 py-3.5 rounded-xl gradient-btn-pink text-white font-bold no-underline hover:opacity-90 transition-opacity">
          Generate My Roadmap →
        </Link>
        <Link to="/colleges" className="px-8 py-3.5 rounded-xl border border-white/10 text-white font-semibold no-underline hover:bg-surface transition-colors">
          Find Colleges
        </Link>
        <Link to="/quiz" className="px-8 py-3.5 rounded-xl border border-white/10 text-muted font-semibold no-underline hover:text-white transition-colors">
          Retake Quiz
        </Link>
      </div>
    </div>
  )
}