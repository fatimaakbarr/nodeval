import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import MetricCard from '../components/MetricCard'
import ScoreBar from '../components/ScoreBar'

const API = 'https://nodeval-production-4f36.up.railway.app'

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } }
  }
}

export default function Evaluator() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [reference, setReference] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCot, setShowCot] = useState(false)

  const clear = () => { setPrompt(''); setResponse(''); setReference(''); setResult(null); setError('') }

  const run = async () => {
    if (!prompt || !response) { setError('Please enter both a prompt and a response.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await axios.post(`${API}/evaluate`, { prompt, response, reference })
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Evaluation failed. Is the backend running?')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen px-10 pb-20 pt-12 max-w-[1400px] mx-auto">

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(172,163,255,0.06) 0%, transparent 70%)', zIndex: 0 }} />

      {/* Hero */}
      <motion.section className="mb-16 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
          style={{ background: 'rgba(172,163,255,0.08)', border: '1px solid rgba(172,163,255,0.15)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">Evaluation Engine</span>
        </div>
        <h1 className="font-headline font-extrabold leading-none tracking-tighter mb-6"
          style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
          The Single Point<br />
          <span className="kinetic-gradient-text">of Truth.</span>
        </h1>
        <p className="font-body text-on-surface-variant text-lg max-w-xl leading-relaxed">
          Execute deep neural analysis on your model's responses. Score, validate, and optimize with mathematical certainty.
        </p>
      </motion.section>

      {/* Input zone */}
      <motion.section className="mb-10 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16,1,0.3,1] }}>

        {/* Glow behind input */}
        <div className="absolute -inset-4 rounded-[3rem] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(172,163,255,0.1) 0%, transparent 70%)', zIndex: -1 }} />

        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: 'User Prompt', val: prompt, set: setPrompt, ph: 'Paste your model endpoint or input query here...' },
            { label: 'Bot Response', val: response, set: setResponse, ph: 'Paste the chatbot response to evaluate...' },
          ].map((f, i) => (
            <motion.div key={f.label}
              className="glass-card rounded-[1.75rem] p-6 group transition-all duration-500"
              whileFocus={{ borderColor: 'rgba(172,163,255,0.3)' }}
              style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="absolute top-4 left-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary/60 text-base">auto_awesome</span>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">{f.label}</span>
              </div>
              <textarea
                value={f.val}
                onChange={e => f.set(e.target.value)}
                placeholder={f.ph}
                className="w-full h-32 bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/25 resize-none focus:outline-none font-body text-sm leading-relaxed pt-8"
              />
            </motion.div>
          ))}
        </div>

        <motion.div className="glass-card rounded-[1.75rem] p-5 mb-5">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 mb-2 block">
            Reference Answer <span className="normal-case">— optional, enables semantic similarity scoring</span>
          </span>
          <textarea
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="Paste an ideal reference answer for comparison..."
            className="w-full h-14 bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/25 resize-none focus:outline-none font-body text-sm leading-relaxed"
          />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div className="mb-4 px-5 py-3 rounded-2xl font-label text-sm"
              style={{ background: 'rgba(255,110,132,0.08)', border: '1px solid rgba(255,110,132,0.2)', color: '#ff6e84' }}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <motion.button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-label font-bold text-on-primary-fixed disabled:opacity-40 disabled:cursor-not-allowed kinetic-gradient"
            style={{ boxShadow: '0 0 40px rgba(172,163,255,0.3)' }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 60px rgba(172,163,255,0.5)' }}
            whileTap={{ scale: 0.97 }}>
            <span className="material-symbols-outlined text-lg">{loading ? 'hourglass_top' : 'play_arrow'}</span>
            {loading ? 'Analyzing...' : 'Run Evaluation'}
          </motion.button>
          <motion.button
            onClick={clear}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-label font-medium text-sm"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(252,248,254,0.5)' }}
            whileHover={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(252,248,254,0.8)' }}
            whileTap={{ scale: 0.97 }}>
            <span className="material-symbols-outlined text-base">refresh</span>
            Clear
          </motion.button>
        </div>
      </motion.section>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-10 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <motion.span className="material-symbols-outlined text-primary text-xl"
                animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                autorenew
              </motion.span>
              <span className="font-label text-sm text-on-surface-variant uppercase tracking-widest">Thinking with Chain-of-Thought...</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['Analyzing coherence', 'Scoring relevance', 'Running safety check'].map((s, i) => (
                <motion.div key={s} className="glass-card rounded-2xl p-5 shimmer"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}>
                  <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40 mb-2">{s}</div>
                  <div className="h-6 rounded-lg bg-surface-container-high/50 shimmer" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}>

            {/* Bento grid */}
            <div className="grid grid-cols-12 gap-4 mb-6">

              {/* Global score gauge */}
              <motion.div
                className="col-span-4 glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group"
                whileHover={{ scale: 1.01 }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-6">Aggregate Score</div>
                <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(172,163,255,0.1)" strokeWidth="6" />
                    <motion.circle cx="50" cy="50" r="42" fill="transparent"
                      stroke="url(#scoreGrad)" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - result.overall_score / 100) }}
                      transition={{ duration: 1.5, ease: [0.16,1,0.3,1] }} />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#aca3ff" />
                        <stop offset="100%" stopColor="#00d2ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span className="font-headline font-extrabold text-5xl text-on-surface"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}>
                      {result.overall_score}
                    </motion.span>
                    <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">Score</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: result.verdict, color: result.verdict === 'PASS' ? '#00d2ff' : result.verdict === 'WARNING' ? '#fbbf24' : '#ff6e84' }
                  ].map(b => (
                    <span key={b.label} className="px-4 py-1.5 rounded-full font-label text-xs font-bold uppercase tracking-widest"
                      style={{ background: `${b.color}18`, border: `1px solid ${b.color}30`, color: b.color }}>
                      {b.label}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Metric cards */}
              <div className="col-span-8 grid grid-cols-2 gap-4">
                {[
                  { label: 'Semantic Similarity', value: result.semantic_similarity ? `${result.semantic_similarity}%` : '—', icon: 'hub', color: '#aca3ff', sub: reference ? 'vs reference' : 'no reference' },
                  { label: 'Latency', value: `${result.latency_ms}ms`, icon: 'speed', color: '#00d2ff', sub: 'inference time' },
                  { label: 'Coherence', value: `${result.coherence}`, icon: 'psychology', color: '#e69dff', sub: 'out of 100' },
                  { label: 'Safety', value: `${result.safety}`, icon: 'verified_user', color: result.safety >= 80 ? '#00d2ff' : '#ff6e84', sub: result.safety >= 80 ? 'clear' : 'flagged' },
                ].map((card, i) => (
                  <motion.div key={card.label}
                    className="glass-card rounded-[1.5rem] p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 rounded-xl" style={{ background: `${card.color}14` }}>
                        <span className="material-symbols-outlined text-xl" style={{ color: card.color }}>{card.icon}</span>
                      </div>
                      <span className="font-label font-black text-3xl" style={{ color: card.color }}>{card.value}</span>
                    </div>
                    <div>
                      <div className="font-headline font-bold text-on-surface text-base mb-0.5">{card.label}</div>
                      <div className="font-label text-xs text-on-surface-variant">{card.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Score breakdown + analysis */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <motion.div className="glass-card rounded-[1.5rem] p-7"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}>
                <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 mb-6">Dimension Scores</div>
                {['coherence','relevance','fluency','safety','empathy'].map((d, i) => (
                  <ScoreBar key={d} label={d} value={result[d]} index={i} />
                ))}
              </motion.div>

              <div className="flex flex-col gap-4">
                <motion.div className="glass-card rounded-[1.5rem] p-6 flex-1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-base">auto_awesome</span>
                    <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">AI Reasoning</div>
                  </div>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{result.reasoning}</p>
                </motion.div>
                <motion.div className="glass-card rounded-[1.5rem] p-6 flex-1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38 }}>
                  <div className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 mb-3">Improvement Suggestion</div>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">{result.improvement}</p>
                </motion.div>
              </div>
            </div>

            {/* Chain of thought */}
            {result.chain_of_thought && (
              <motion.div className="glass-card rounded-[1.5rem] overflow-hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                <button onClick={() => setShowCot(!showCot)}
                  className="w-full flex items-center justify-between px-7 py-5 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-base">account_tree</span>
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">
                      Chain-of-Thought Reasoning
                    </span>
                  </div>
                  <motion.span className="material-symbols-outlined text-on-surface-variant text-base"
                    animate={{ rotate: showCot ? 180 : 0 }}>
                    expand_more
                  </motion.span>
                </button>
                <AnimatePresence>
                  {showCot && (
                    <motion.div className="px-7 pb-7 space-y-4"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}>
                      {Object.entries(result.chain_of_thought).map(([k, v]) => (
                        <div key={k} className="pt-4">
                          <div className="font-label text-[10px] font-bold mb-2 uppercase tracking-widest" style={{ color: '#aca3ff' }}>
                            {k.replace('_reasoning', '')}
                          </div>
                          <p className="font-mono text-xs text-on-surface-variant/60 leading-relaxed">{v}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}