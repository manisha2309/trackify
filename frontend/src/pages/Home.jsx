import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const STATS = [
  { num: '8', label: 'Career Matches in Quiz' },
  { num: 'AI', label: 'Generated Roadmaps'    },
  { num: 'Live', label: 'Real LeetCode Stats' },
  { num: 'Directory', label: 'University Search' },
]

const FEATURES = [
  { icon: '📊', title: 'LeetCode Auto-Sync', desc: 'Real LeetCode stats synced live. Heatmaps, streaks, ranking, and recent submissions.', tag: '⚡ Live Sync', col: 'span 2' },
  { icon: '🎯', title: 'AI Career Quiz',     desc: '8-question quiz evaluates your strengths across 8 career matches in the quiz with AI match scoring.', tag: '🔥 Popular' },
  { icon: '🌐', title: 'Career Tree',        desc: 'Explore career paths in interactive space built with Three.js.',                       tag: '✨ New'        },
  { icon: '🏛️', title: 'College Finder',    desc: 'University directory search across colleges with real-time domains and information.',  tag: '✓ Live'       },
  { icon: '🗺️', title: 'AI Roadmap',        desc: 'AI-generated roadmaps with step-by-step learning plans personalized to your career goals.', tag: '✓ Live' },
  { icon: '📄', title: 'Resume Analyzer',    desc: 'Privacy-friendly resume analyzer running entirely in your browser with instant ATS tips.', tag: '🔒 100% Private' },
]

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Ambient orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'rgba(0,212,255,0.07)', filter: 'blur(120px)', zIndex: 0 }} />
      <div className="fixed bottom-20 right-0 w-80 h-80 rounded-full pointer-events-none"
           style={{ background: 'rgba(255,45,159,0.06)', filter: 'blur(120px)', zIndex: 0 }} />

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-40 pb-24 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan/30 bg-cyan/5 text-cyan text-xs font-bold uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          AI-Powered Career Intelligence
        </div>

        <h1 className="font-display font-black text-7xl leading-none tracking-tighter mb-6 max-w-4xl">
          <div className="text-white">Discover Your</div>
          <div className="gradient-text">Career DNA</div>
          <div className="text-white">Track Everything</div>
        </h1>

        <p className="text-muted text-lg max-w-xl leading-relaxed mb-12">
          AI-driven career guidance meets real-time LeetCode progress tracking. Personalized roadmaps, college matching & 3D visualization — built for India's next generation.
        </p>

        <div className="flex gap-4 flex-wrap justify-center mb-16">
          <Link to="/quiz" className="px-8 py-4 rounded-xl gradient-btn-pink text-white font-bold text-base no-underline hover:opacity-90 transition-opacity">
            ⚡ Start Free Quiz
          </Link>
          <Link to="/colleges" className="px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-base no-underline hover:bg-surface transition-colors">
            Explore Colleges
          </Link>
        </div>

        {/* Stats bar */}
        <div className="card flex gap-16 px-12 py-6">
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col gap-1 text-center">
              <span className="font-display font-black text-3xl gradient-text">{s.num}</span>
              <span className="text-xs font-bold text-muted uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-3">Platform Features</p>
        <h2 className="font-display font-black text-5xl tracking-tight mb-4">
          Powerful tools for your <span className="gradient-text">future</span>
        </h2>
        <p className="text-muted text-base mb-16 max-w-lg">Every tool you need to discover, plan, and track your career — from AI assessments to real-time coding progress.</p>

        <div className="grid grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="card card-hover p-8 relative overflow-hidden cursor-pointer"
              style={{ gridColumn: f.col || 'span 1' }}>
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center text-2xl mb-5">{f.icon}</div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-4">{f.desc}</p>
              <span className="inline-block px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-bold">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="card p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, #ff2d9f, transparent)' }} />
          <h2 className="font-display font-black text-5xl tracking-tight mb-4">
            Ready to find your <span className="gradient-text">path?</span>
          </h2>
          <p className="text-muted text-lg mb-8">Take the free AI quiz and get your personalized career roadmap in 2 minutes.</p>
          <Link to="/register" className="inline-block px-10 py-4 rounded-xl gradient-btn-pink text-white font-bold text-base no-underline hover:opacity-90 transition-opacity">
            Get Started Free →
          </Link>
        </div>
      </section>
    </main>
  )
}