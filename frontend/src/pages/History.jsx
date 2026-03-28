import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const API = 'https://nodeval-production.up.railway.app'
const VERDICT_COLORS = { PASS: '#00d2ff', WARNING: '#fbbf24', FAIL: '#ff6e84' }
const DIM_COLORS = ['#aca3ff','#00d2ff','#e69dff','#ff6e84','#fbbf24']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl px-4 py-3 text-xs shadow-2xl font-label"
      style={{ background: 'rgba(14,14,18,0.95)', border: '1px solid rgba(172,163,255,0.15)', backdropFilter: 'blur(12px)' }}>
      <div className="text-on-surface-variant mb-1">{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  )
}

export default function History() {
  const [evals, setEvals] = useState([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try { const res = await axios.get(`${API}/history`); setEvals(res.data) }
    catch (e) { console.error(e) }
    setLoading(false)
  }

  const clearHistory = async () => {
    if (!confirm('Clear all evaluation history?')) return
    setClearing(true)
    try { await axios.delete(`${API}/history`); setEvals([]) }
    catch (e) { console.error(e) }
    setClearing(false)
  }

  useEffect(() => { load() }, [])

  const filtered = evals.filter(e => e.prompt?.toLowerCase().includes(search.toLowerCase()))

  const trendData = [...evals].reverse().slice(-20).map((e, i) => ({
    i: i+1, score: e.overall_score, semantic: e.semantic_similarity || 0
  }))

  const avgData = ['coherence','relevance','fluency','safety','empathy'].map((d, i) => ({
    name: d, value: evals.length ? Math.round(evals.reduce((s,e) => s+(e[d]||0),0)/evals.length) : 0
  }))

  const verdictCounts = ['PASS','WARNING','FAIL']
    .map(v => ({ name: v, value: evals.filter(e => e.verdict === v).length }))
    .filter(v => v.value > 0)

  const avgScore = evals.length ? Math.round(evals.reduce((s,e) => s+e.overall_score,0)/evals.length) : 0
  const passRate = evals.length ? Math.round(evals.filter(e => e.verdict==='PASS').length/evals.length*100) : 0
  const violations = evals.filter(e => e.violation_detected).length
  const avgLatency = evals.length ? Math.round(evals.reduce((s,e) => s+(e.latency_ms||0),0)/evals.length) : 0

  return (
    <div className="min-h-screen px-10 pb-20 pt-12 max-w-[1400px] mx-auto">

      {/* Timeline path decoration */}
      <div className="fixed left-1/2 top-0 bottom-0 w-px pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(172,163,255,0.08), rgba(0,210,255,0.08), transparent)', zIndex: 0 }} />

      {/* Hero */}
      <motion.div className="mb-16 relative z-10"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="font-label text-primary uppercase tracking-[0.3em] text-sm mb-4 block">Archive // Timeline</span>
            <h1 className="font-headline font-extrabold tracking-tighter leading-tight mb-4"
              style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
              Evaluation <br/><span className="kinetic-gradient-text">History</span>
            </h1>
            <p className="font-body text-on-surface-variant text-lg">Track performance trends and analyze evaluations over time.</p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <div className="relative group">
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="glass-card rounded-2xl px-5 py-3 pr-10 w-64 text-on-surface placeholder:text-on-surface-variant/40 font-label text-sm focus:outline-none"
                style={{ border: '1px solid rgba(172,163,255,0.12)' }}
                placeholder="Search parameters..." />
            </div>
            <div className="flex gap-2">
              <motion.button onClick={load}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-label text-xs"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(252,248,254,0.5)' }}
                whileHover={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(252,248,254,0.8)' }}
                whileTap={{ scale: 0.97 }}>
                <span className="material-symbols-outlined text-base" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>refresh</span>
                Refresh
              </motion.button>
              <motion.button onClick={clearHistory} disabled={clearing || !evals.length}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-label text-xs disabled:opacity-40"
                style={{ background: 'rgba(255,110,132,0.06)', border: '1px solid rgba(255,110,132,0.15)', color: '#ff6e84' }}
                whileHover={{ background: 'rgba(255,110,132,0.12)' }}
                whileTap={{ scale: 0.97 }}>
                <span className="material-symbols-outlined text-base">delete</span>
                Clear
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-[2rem] shimmer" />)}
        </div>
      ) : evals.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center py-40 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mb-6"
            animate={{ y: [0,-12,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">history</span>
          </motion.div>
          <div className="font-headline font-bold text-2xl text-on-surface/30 mb-2">No evaluations yet</div>
          <div className="font-body text-on-surface-variant/40">Run some evaluations and they'll appear here</div>
        </motion.div>
      ) : (
        <motion.div className="space-y-6 relative z-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Total', value: evals.length, color: '#aca3ff', icon: 'data_usage' },
              { label: 'Avg Score', value: avgScore, color: avgScore >= 80 ? '#00d2ff' : avgScore >= 60 ? '#fbbf24' : '#ff6e84', icon: 'analytics' },
              { label: 'Pass Rate', value: `${passRate}%`, color: passRate >= 70 ? '#00d2ff' : '#fbbf24', icon: 'check_circle' },
              { label: 'Violations', value: violations, color: violations > 0 ? '#ff6e84' : '#00d2ff', icon: 'warning' },
              { label: 'Avg Latency', value: `${avgLatency}ms`, color: '#e69dff', icon: 'speed' },
            ].map((c, i) => (
              <motion.div key={c.label}
                className="glass-card rounded-[1.5rem] p-6 group cursor-default"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16,1,0.3,1] }}
                whileHover={{ scale: 1.02 }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-xl" style={{ background: `${c.color}14` }}>
                    <span className="material-symbols-outlined text-base" style={{ color: c.color }}>{c.icon}</span>
                  </div>
                </div>
                <div className="font-headline font-extrabold text-4xl mb-1" style={{ color: c.color }}>{c.value}</div>
                <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{c.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div className="col-span-2 glass-card rounded-[1.5rem] p-7"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">trending_up</span>
                  <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">Score Trend</div>
                </div>
                <div className="flex items-center gap-4 font-label text-[10px] text-on-surface-variant">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-primary inline-block rounded" />Score</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-secondary inline-block rounded" />Semantic</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData}>
                  <XAxis dataKey="i" tick={{ fill: 'rgba(172,170,176,0.4)', fontSize: 10, fontFamily: 'Space Grotesk' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0,100]} tick={{ fill: 'rgba(172,170,176,0.4)', fontSize: 10, fontFamily: 'Space Grotesk' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke="#aca3ff" strokeWidth={2} dot={false} name="Score" />
                  <Line type="monotone" dataKey="semantic" stroke="#00d2ff" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Semantic" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="glass-card rounded-[1.5rem] p-7"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-base">donut_large</span>
                <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">Verdicts</div>
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie data={verdictCounts} cx="50%" cy="50%" innerRadius={32} outerRadius={48} dataKey="value" paddingAngle={4}>
                    {verdictCounts.map((entry, i) => <Cell key={i} fill={VERDICT_COLORS[entry.name]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-3">
                {verdictCounts.map(v => (
                  <div key={v.name} className="flex items-center justify-between font-label text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: VERDICT_COLORS[v.name] }} />
                      <span className="text-on-surface-variant">{v.name}</span>
                    </div>
                    <span className="font-bold text-on-surface">{v.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Avg dimension bars */}
          <motion.div className="glass-card rounded-[1.5rem] p-7"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}>
            <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 mb-6">Average Dimension Scores</div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={avgData} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(172,170,176,0.4)', fontSize: 11, fontFamily: 'Space Grotesk' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0,100]} tick={{ fill: 'rgba(172,170,176,0.4)', fontSize: 10, fontFamily: 'Space Grotesk' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4,4,0,0]} name="Avg Score">
                  {avgData.map((_,i) => <Cell key={i} fill={DIM_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Timeline entries */}
          <div className="relative">
            <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-6">Recent Evaluations</div>
            <div className="space-y-6">
              {filtered.map((e, i) => (
                <motion.div key={i}
                  className="relative flex gap-8 group"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: [0.16,1,0.3,1] }}>

                  {/* Timeline anchor */}
                  <div className="flex-shrink-0 flex flex-col items-end w-24 pt-6">
                    <div className="font-label text-xs text-on-surface-variant/40 text-right leading-tight">
                      {new Date(e.timestamp).toLocaleDateString()}<br/>
                      <span className="text-[10px]">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Dot */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="w-3 h-3 rounded-full mt-7 relative z-10"
                      style={{ background: VERDICT_COLORS[e.verdict] || '#aca3ff', boxShadow: `0 0 12px ${VERDICT_COLORS[e.verdict] || '#aca3ff'}60` }}
                      whileHover={{ scale: 1.5 }}>
                      <div className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: VERDICT_COLORS[e.verdict] || '#aca3ff', opacity: 0.2 }} />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <motion.div
                    className="flex-1 glass-card rounded-[1.5rem] p-7 group-hover:translate-x-1 transition-transform duration-300"
                    whileHover={{ borderColor: `${VERDICT_COLORS[e.verdict] || '#aca3ff'}30` }}>
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Session #{1000 + i}</div>
                        <h3 className="font-headline font-bold text-xl text-on-surface mb-1 truncate">{e.prompt}</h3>
                        <p className="font-body text-sm text-on-surface-variant truncate">{e.response}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="font-headline font-black text-4xl"
                          style={{ color: e.overall_score >= 80 ? '#00d2ff' : e.overall_score >= 60 ? '#fbbf24' : '#ff6e84' }}>
                          {e.overall_score}
                        </div>
                        <span className="font-label text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest"
                          style={{
                            color: VERDICT_COLORS[e.verdict],
                            background: `${VERDICT_COLORS[e.verdict]}12`,
                            border: `1px solid ${VERDICT_COLORS[e.verdict]}30`,
                          }}>
                          {e.verdict}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {[
                        { label: 'Coherence', value: e.coherence, color: '#aca3ff' },
                        { label: 'Safety', value: e.safety, color: e.safety >= 80 ? '#00d2ff' : '#ff6e84' },
                        { label: 'Latency', value: `${e.latency_ms}ms`, color: '#e69dff', raw: true },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{m.label}</div>
                          <div className="font-headline font-extrabold text-2xl" style={{ color: m.color }}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {e.violation_detected && (
                      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(255,110,132,0.06)', border: '1px solid rgba(255,110,132,0.15)' }}>
                        <span className="material-symbols-outlined text-error text-sm">warning</span>
                        <span className="font-label text-xs text-error">Violation detected</span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {filtered.length > 5 && (
              <div className="flex justify-center mt-12">
                <button className="flex items-center gap-4 group font-label text-sm uppercase tracking-[0.4em] text-on-surface-variant hover:text-primary transition-colors">
                  <span className="h-px w-16 bg-outline-variant group-hover:w-24 transition-all duration-500" />
                  View Deep History
                  <span className="h-px w-16 bg-outline-variant group-hover:w-24 transition-all duration-500" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}