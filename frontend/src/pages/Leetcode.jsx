import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function HeatMap({ calendar }) {
  const data = Object.entries(calendar || {})
  const maxVal = Math.max(...data.map(([,v]) => v), 1)

  const cells = []
  for (let i = 0; i < 26 * 7; i++) cells.push(0)

  data.forEach(([ts, count]) => {
    const date = new Date(parseInt(ts) * 1000)
    const day  = Math.floor((Date.now() - date) / 86400000)
    const idx  = (26 * 7 - 1) - day
    if (idx >= 0 && idx < cells.length) cells[idx] = count
  })

  const getColor = (val) => {
    if (!val) return 'rgba(26,37,64,0.8)'
    const ratio = val / maxVal
    if (ratio < 0.25) return 'rgba(0,212,255,0.2)'
    if (ratio < 0.5)  return 'rgba(0,212,255,0.45)'
    if (ratio < 0.75) return 'rgba(0,212,255,0.7)'
    return '#00d4ff'
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(26,1fr)', gap: '3px' }}>
      {cells.map((val, i) => (
        <div key={i} title={val ? `${val} submissions` : ''}
          style={{ aspectRatio:'1', borderRadius:'2px', background: getColor(val), cursor: val ? 'pointer' : 'default' }} />
      ))}
    </div>
  )
}

export default function LeetCode() {
  const { user, updateUser } = useAuthStore()
  const [username, setUsername]   = useState(user?.leetcodeUsername || '')
  const [inputVal, setInputVal]   = useState(user?.leetcodeUsername || '')
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leetcode', username],
    queryFn: () => api.get(`/leetcode/${username}`).then(r => r.data),
    enabled: !!username,
  })

  // const handleSync = async () => {
  //   if (!inputVal.trim()) return
  //   try {
  //     setRefreshing(true)
  //     setUsername(inputVal.trim())
  //     await api.put('/profile/me', { leetcodeUsername: inputVal.trim() })
  //     updateUser({ leetcodeUsername: inputVal.trim() })
  //     await refetch()
  //     toast.success('LeetCode stats synced!')
  //   } catch { toast.error('User not found on LeetCode') }
  //   finally { setRefreshing(false) }
  // }

  const handleSync = async () => {
    if (!inputVal.trim()) return
    try {
      setRefreshing(true)
      const target = inputVal.trim()
      setUsername(target)
      await api.get(`/leetcode/${target}?refresh=true`)
      await refetch()
      toast.success('LeetCode stats synced!')
    } catch {
      toast.error('User not found on LeetCode')
    } finally {
      setRefreshing(false)
    }
  }

  const stats = data || {}
  const totalQuestions = (stats.totalEasy || 870) + (stats.totalMedium || 1800) + (stats.totalHard || 780)
  const solvedPct = stats.totalSolved ? Math.round((stats.totalSolved / totalQuestions) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-2">Progress Tracker</p>
        <h1 className="font-display font-black text-5xl tracking-tight text-white mb-2">
          LeetCode <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-muted">Auto-sync your coding progress. No manual entry needed.</p>
      </div>

      {/* Username input */}
      <div className="card p-6 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">LeetCode Username</label>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSync()}
            placeholder="e.g. binarybrosfx"
            className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/10 text-white placeholder-faint text-sm outline-none focus:border-cyan/50 transition-colors"
          />
        </div>
        <button onClick={handleSync} disabled={isLoading || refreshing}
          className="px-6 py-3 rounded-xl gradient-btn text-white font-bold text-sm border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
          {isLoading || refreshing ? '⏳ Syncing...' : '↻ Sync Stats'}
        </button>
      </div>

      {error && <div className="card p-6 text-center text-magenta mb-6">⚠️ LeetCode user not found. Check username and try again.</div>}

      {data && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            {[
              { label: 'Total Solved', val: stats.totalSolved, color: '#00d4ff',  sub: `${solvedPct}% of all problems` },
              { label: 'Easy',   val: stats.easySolved,   color: '#10d87b',  sub: `out of ${stats.totalEasy || 870}`   },
              { label: 'Medium', val: stats.mediumSolved, color: '#ffb020',  sub: `out of ${stats.totalMedium || 1800}` },
              { label: 'Hard',   val: stats.hardSolved,   color: '#ff2d9f',  sub: `out of ${stats.totalHard || 780}`   },
            ].map(({ label, val, color, sub }) => (
              <div key={label} className="card p-5 text-center" style={{ borderColor: `${color}30` }}>
                <div className="font-display font-black text-4xl mb-1" style={{ color }}>{val ?? '—'}</div>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>{label}</div>
                <div className="text-xs text-faint">{sub}</div>
              </div>
            ))}
          </div>

          {/* Ranking & Streak */}
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center text-2xl">🏆</div>
              <div>
                <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Global Ranking</div>
                <div className="font-display font-black text-2xl text-amber">#{stats.ranking?.toLocaleString() || '—'}</div>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl">🔥</div>
              <div>
                <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Current Streak</div>
                <div className="font-display font-black text-2xl" style={{ color: '#ff6b2b' }}>{stats.streak || 0} days</div>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white">Submission Activity — Last 6 Months</span>
              <div className="flex items-center gap-2 text-xs text-faint">
                <span>Less</span>
                {['rgba(26,37,64,0.8)','rgba(0,212,255,0.2)','rgba(0,212,255,0.45)','rgba(0,212,255,0.7)','#00d4ff'].map((c,i) => (
                  <div key={i} style={{ width:12, height:12, borderRadius:2, background:c }} />
                ))}
                <span>More</span>
              </div>
            </div>
            <HeatMap calendar={stats.submissionCalendar} />
          </div>

          {/* Recent Submissions */}
          {stats.recentSubmissions?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-white mb-4">Recent Submissions</h3>
              <div className="flex flex-col gap-2">
                {stats.recentSubmissions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white">{s.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-faint">{s.lang}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.status === 'Accepted' ? 'bg-ngreen/10 text-ngreen' : 'bg-magenta/10 text-magenta'}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!username && (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="font-display font-bold text-2xl text-white mb-2">Connect Your LeetCode</h3>
          <p className="text-muted">Enter your LeetCode username above to auto-sync your progress stats, heatmap, and streak.</p>
        </div>
      )}
    </div>
  )
}