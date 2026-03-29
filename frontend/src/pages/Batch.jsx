import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ScoreBar from '../components/ScoreBar'

const API = 'https://nodeval-production-ab38.up.railway.app'
const EXAMPLE = `What is the capital of France? | The capital of France is Paris.
How do I reset my password? | Click forgot password on the login page.
I feel really sad today. | Get over it, everyone feels sad sometimes.
What are symptoms of diabetes? | Increased thirst, frequent urination and fatigue.
Explain quantum computing. | Quantum computers use qubits to process information faster.`

const STAGES = [
  { icon: 'input', label: 'Ingest', sub: 'Normalizing input data streams', color: '#aca3ff' },
  { icon: 'psychology', label: 'Analyze', sub: 'Deep semantic auditing', color: '#00d2ff' },
  { icon: 'verified', label: 'Score', sub: 'Confidence ranking report', color: '#e69dff' },
]

export default function Batch() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeStage, setActiveStage] = useState(-1)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const lineCount = input.trim().split('\n').filter(l => l.includes('|')).length

  const clear = () => { setInput(''); setResults([]); setProgress(0); setError(''); setDone(false); setActiveStage(-1) }

  const run = async () => {
    const lines = input.trim().split('\n').filter(l => l.includes('|'))
    if (!lines.length) { setError('Enter at least one line in prompt | response format.'); return }
    setError(''); setLoading(true); setResults([]); setDone(false); setProgress(0); setActiveStage(0)

    const items = lines.map(line => {
      const parts = line.split('|')
      return { prompt: parts[0]?.trim() || '', response: parts[1]?.trim() || '', reference: parts[2]?.trim() || '' }
    })

    try {
      const stageInterval = setInterval(() => {
        setActiveStage(s => s < 2 ? s + 1 : s)
      }, 1500)
      const progInterval = setInterval(() => setProgress(p => Math.min(p + 1.5, 90)), 200)

      const res = await axios.post(`${API}/batch`, { items })
      clearInterval(stageInterval); clearInterval(progInterval)
      setProgress(100); setActiveStage(2)
      setResults(res.data.results); setDone(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'Batch evaluation failed.')
    }
    setLoading(false)
  }

  const downloadCSV = () => {
    const headers = ['prompt','response','coherence','relevance','fluency','safety','empathy','overall_score','verdict']
    const rows = results.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'nodeval_batch.csv'; a.click()
  }

  const avgScore = results.length ? Math.round(results.reduce((s,r) => s+r.overall_score,0)/results.length) : 0

  return (
    <div className="min-h-screen px-10 pb-20 pt-12 max-w-[1400px] mx-auto">

      {/* Hero */}
      <motion.div className="mb-16"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <h1 className="font-headline font-extrabold tracking-tighter leading-none mb-4"
              style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}>
              Batch <span className="kinetic-gradient-text italic">Evaluator</span>
            </h1>
            <p className="font-body text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Unleash massive scale testing. Process thousands of queries through the neural pipeline in seconds.
            </p>
          </div>
          <div className="flex gap-3 font-label flex-shrink-0">
            <div className="px-5 py-4 glass-card rounded-2xl">
              <span className="text-[10px] text-secondary tracking-widest uppercase block mb-1">Status</span>
              <span className="font-bold text-on-surface">Engine Ready</span>
            </div>
            <div className="px-5 py-4 glass-card rounded-2xl">
              <span className="text-[10px] text-primary tracking-widest uppercase block mb-1">Queue</span>
              <span className="font-bold text-on-surface">{lineCount} Pending</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Drop zone */}
      <motion.div className="mb-10 relative group"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16,1,0.3,1] }}>
        <div className="absolute -inset-1 kinetic-gradient opacity-0 group-focus-within:opacity-20 blur-2xl rounded-[2rem] transition-opacity duration-700 pointer-events-none" />
        <div className="relative glass-card rounded-[1.75rem] p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl kinetic-gradient">
                <span className="material-symbols-outlined text-black text-lg">upload_file</span>
              </div>
              <div>
                <div className="font-headline font-bold text-on-surface">Drop your datasets here</div>
                <div className="font-label text-xs text-on-surface-variant">One line per test case: <span className="font-mono text-primary">prompt | response | reference(optional)</span></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-label text-xs text-on-surface-variant">{lineCount} cases</span>
              <button onClick={() => setInput(EXAMPLE)}
                className="font-label text-xs text-primary hover:text-secondary transition-colors uppercase tracking-widest">
                Load Example
              </button>
            </div>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder={"What is the capital of France? | The capital is Paris.\nHow do I reset my password? | Click forgot password..."}
            className="w-full h-36 bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/25 font-mono text-sm resize-none focus:outline-none leading-relaxed" />
        </div>
      </motion.div>

      {/* Pipeline stages */}
      <motion.div className="mb-8 flex items-center justify-between gap-4 relative"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}>
        <div className="absolute top-1/2 left-0 w-full h-px pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />
        {STAGES.map((stage, i) => (
          <motion.div key={stage.label}
            className="flex-1 glass-card rounded-2xl p-5 relative transition-all duration-500"
            style={{
              borderColor: activeStage >= i ? `${stage.color}30` : 'rgba(255,255,255,0.05)',
              background: activeStage >= i ? `${stage.color}08` : 'rgba(44,43,50,0.7)',
            }}>
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl flex items-center justify-center kinetic-gradient shadow-lg"
              style={{ opacity: activeStage >= i ? 1 : 0.3, transition: 'opacity 0.5s' }}>
              <span className="material-symbols-outlined text-black text-sm">{stage.icon}</span>
            </div>
            <span className="font-label text-[9px] uppercase tracking-widest mb-2 block" style={{ color: stage.color }}>Stage 0{i+1}</span>
            <div className="font-headline font-bold text-on-surface mb-1">{stage.label}</div>
            <div className="font-body text-xs text-on-surface-variant">{stage.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div className="mb-5 px-5 py-3 rounded-2xl font-label text-sm"
            style={{ background: 'rgba(255,110,132,0.08)', border: '1px solid rgba(255,110,132,0.2)', color: '#ff6e84' }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 mb-8">
        <motion.button onClick={run} disabled={loading}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-label font-bold text-on-primary-fixed disabled:opacity-40 kinetic-gradient"
          style={{ boxShadow: '0 0 40px rgba(172,163,255,0.25)' }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 60px rgba(172,163,255,0.45)' }}
          whileTap={{ scale: 0.97 }}>
          <span className="material-symbols-outlined text-black text-lg">{loading ? 'hourglass_top' : 'play_arrow'}</span>
          {loading ? 'Processing...' : 'Run Batch'}
        </motion.button>
        <motion.button onClick={clear}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-label font-medium text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(252,248,254,0.5)' }}
          whileHover={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(252,248,254,0.8)' }}
          whileTap={{ scale: 0.97 }}>
          <span className="material-symbols-outlined text-base">refresh</span>
          Clear
        </motion.button>
        <AnimatePresence>
          {done && (
            <motion.button onClick={downloadCSV}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl font-label font-medium text-sm ml-auto"
              style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.2)', color: '#00d2ff' }}
              whileHover={{ background: 'rgba(0,210,255,0.14)' }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <span className="material-symbols-outlined text-base">cloud_download</span>
              Download Report
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {loading && (
          <motion.div className="mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between font-label text-xs text-on-surface-variant mb-2">
              <span className="flex items-center gap-2">
                <motion.span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"
                  animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1, repeat: Infinity }} />
                Neural pipeline processing...
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full kinetic-gradient rounded-full"
                animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Processed', value: results.length, color: '#aca3ff', icon: 'data_usage' },
                { label: 'Average Score', value: avgScore, color: avgScore >= 80 ? '#00d2ff' : avgScore >= 60 ? '#fbbf24' : '#ff6e84', icon: 'analytics' },
                { label: 'Passed', value: results.filter(r => r.verdict === 'PASS').length, color: '#00d2ff', icon: 'check_circle' },
                { label: 'Failed', value: results.filter(r => r.verdict === 'FAIL').length, color: '#ff6e84', icon: 'cancel' },
              ].map((c, i) => (
                <motion.div key={c.label} className="glass-card rounded-[1.5rem] p-6"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl" style={{ background: `${c.color}14` }}>
                      <span className="material-symbols-outlined text-base" style={{ color: c.color }}>{c.icon}</span>
                    </div>
                    <span className="font-headline font-black text-4xl" style={{ color: c.color }}>{c.value}</span>
                  </div>
                  <div className="font-label text-xs text-on-surface-variant uppercase tracking-widest">{c.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Results list */}
            <div className="space-y-3">
              {results.map((r, i) => (
                <motion.div key={i} className="glass-card rounded-[1.5rem] p-6"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16,1,0.3,1] }}
                  whileHover={{ borderColor: 'rgba(172,163,255,0.15)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="font-label text-[10px] text-on-surface-variant mb-1">#{i+1}</div>
                      <div className="font-body text-sm text-on-surface-variant truncate">{r.prompt}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-headline font-bold text-2xl"
                        style={{ color: r.overall_score >= 80 ? '#00d2ff' : r.overall_score >= 60 ? '#fbbf24' : '#ff6e84' }}>
                        {r.overall_score}
                      </span>
                      <span className="font-label text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest"
                        style={{
                          color: r.verdict === 'PASS' ? '#00d2ff' : r.verdict === 'WARNING' ? '#fbbf24' : '#ff6e84',
                          background: r.verdict === 'PASS' ? 'rgba(0,210,255,0.1)' : r.verdict === 'WARNING' ? 'rgba(251,191,36,0.1)' : 'rgba(255,110,132,0.1)',
                          border: `1px solid ${r.verdict === 'PASS' ? 'rgba(0,210,255,0.25)' : r.verdict === 'WARNING' ? 'rgba(251,191,36,0.25)' : 'rgba(255,110,132,0.25)'}`,
                        }}>
                        {r.verdict}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {['coherence','relevance','fluency','safety','empathy'].map((d,j) => (
                      <ScoreBar key={d} label={d} value={r[d]} index={j} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}