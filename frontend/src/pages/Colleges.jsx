// // Colleges.jsx
// import { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import api from '../services/api'

// export default function Colleges() {
//   const [search, setSearch] = useState('')
//   const [type, setType] = useState('')

//   const { data, isLoading } = useQuery({
//     queryKey: ['colleges', search, type],
//     queryFn: () => api.get(`/colleges?search=${search}&type=${type}`).then(r => r.data),
//   })

//   return (
//     <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
//       <div className="text-center mb-10">
//         <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-2">College Finder</p>
//         <h1 className="font-display font-black text-5xl tracking-tight text-white mb-2">
//           Find Your <span className="gradient-text">Perfect College</span>
//         </h1>
//         <p className="text-muted">Discover top engineering colleges across India with detailed information</p>
//       </div>

//       {/* Search bar */}
//       <div className="card p-4 flex gap-3 mb-8">
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search colleges or cities..."
//           className="flex-1 bg-transparent border-none text-white placeholder-faint text-sm outline-none" />
//         <select value={type} onChange={e => setType(e.target.value)}
//           className="bg-surface2 border border-white/10 text-muted text-sm rounded-lg px-3 py-2 outline-none">
//           <option value="">All Types</option>
//           <option value="Government">Government</option>
//           <option value="Private">Private</option>
//         </select>
//       </div>

//       {isLoading ? (
//         <div className="text-center text-cyan py-20 animate-pulse">Loading colleges...</div>
//       ) : (
//         <div className="grid grid-cols-3 gap-5">
//           {data?.colleges?.map(c => (
//             <div key={c.id} className="card card-hover p-6 relative">
//               <div className="flex items-start justify-between mb-3">
//                 <span className={`text-xs font-bold px-2 py-1 rounded ${c.type === 'Government' ? 'bg-cyan/10 text-cyan' : 'bg-magenta/10 text-magenta'}`}>
//                   {c.type}
//                 </span>
//                 <span className="text-amber text-sm font-bold">★ {c.rating}</span>
//               </div>
//               <h3 className="font-bold text-white text-base leading-snug mb-1">{c.name}</h3>
//               <p className="text-faint text-xs mb-3">📍 {c.city}, {c.state} · Est. {c.established}</p>
//               <div className="flex gap-4 text-xs text-muted mb-3">
//                 <span>💰 ₹{(c.annualFee/100000).toFixed(1)}L/yr</span>
//                 <span>📊 {c.cutoff}</span>
//               </div>
//               <div className="flex flex-wrap gap-1 mb-4">
//                 {c.courses.slice(0,3).map(course => (
//                   <span key={course} className="text-xs px-2 py-0.5 rounded bg-surface2 border border-white/5 text-faint">{course}</span>
//                 ))}
//                 {c.courses.length > 3 && <span className="text-xs px-2 py-0.5 rounded bg-surface2 border border-white/5 text-faint">+{c.courses.length-3}</span>}
//               </div>
//               <div className="flex items-center justify-between pt-3 border-t border-white/5">
//                 <div>
//                   <div className="text-xs text-muted mb-0.5">Annual Fee</div>
//                   <div className="text-ngreen font-bold text-sm">₹{c.annualFee.toLocaleString()}</div>
//                 </div>
//                 <a href={c.website} target="_blank" rel="noreferrer"
//                   className="px-4 py-2 rounded-lg gradient-btn text-white text-xs font-bold no-underline">
//                   Visit ↗
//                 </a>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

const COUNTRIES = [
  { label: 'All Countries', value: '' },
  { label: 'India',         value: 'India' },
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom',value: 'United Kingdom' },
  { label: 'Canada',        value: 'Canada' },
  { label: 'Australia',     value: 'Australia' },
  { label: 'Germany',       value: 'Germany' },
  { label: 'Singapore',     value: 'Singapore' },
]

export default function Colleges() {
  const [search,  setSearch]  = useState('engineering')
  const [country, setCountry] = useState('')
  const [input,   setInput]   = useState('engineering')
  const [page,    setPage]    = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['colleges', search, country, page],
    queryFn: () =>
      api.get(`/colleges?search=${search}&country=${country}&page=${page}&limit=12`)
         .then(r => r.data),
    keepPreviousData: true,
  })

  const handleSearch = () => {
    setSearch(input)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-2">College Finder</p>
        <h1 className="font-display font-black text-5xl tracking-tight text-white mb-2">
          Find Your <span className="gradient-text">Perfect College</span>
        </h1>
        <p className="text-muted">Search any college or university worldwide</p>
      </div>

      {/* Search bar */}
      <div className="card p-4 flex gap-3 mb-8">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="🔍 Search colleges, universities..."
          className="flex-1 bg-transparent border-none text-white placeholder-faint text-sm outline-none"
        />
        <select
          value={country}
          onChange={e => { setCountry(e.target.value); setPage(1) }}
          className="bg-surface2 border border-white/10 text-muted text-sm rounded-lg px-3 py-2 outline-none"
        >
          {COUNTRIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2 rounded-xl gradient-btn text-white text-sm font-bold border-none cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center text-cyan py-20 animate-pulse">Searching colleges...</div>
      ) : isError ? (
        <div className="text-center text-red-400 py-20">Failed to load colleges. Check career service.</div>
      ) : (
        <>
          <p className="text-faint text-xs mb-4">{data?.total || 0} results found</p>
          <div className="grid grid-cols-3 gap-5">
            {data?.colleges?.map(c => (
              <div key={c.id} className="card card-hover p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      c.type === 'Government'
                        ? 'bg-cyan/10 text-cyan'
                        : 'bg-magenta/10 text-magenta'
                    }`}>
                      {c.type}
                    </span>
                    <span className="text-faint text-xs">{c.alpha_two_code}</span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug mb-1">{c.name}</h3>
                  <p className="text-faint text-xs mb-3">
                    📍 {[c.state, c.country].filter(Boolean).join(', ')}
                  </p>
                  {c.domains?.[0] && (
                    <p className="text-faint text-xs mb-3">🌐 {c.domains[0]}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                 <a 
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg gradient-btn text-white text-xs font-bold no-underline"
                  >
                    Visit ↗
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-white/10 text-muted text-sm disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="text-faint text-sm self-center">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 rounded-lg border border-white/10 text-muted text-sm disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

