import { motion } from 'framer-motion'

export default function ScoreBar({ label, value, max = 100, index = 0 }) {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 80 ? '#00d2ff' : pct >= 60 ? '#fbbf24' : '#ff6e84'
  const glow = pct >= 80 ? 'rgba(0,210,255,0.4)' : pct >= 60 ? 'rgba(251,191,36,0.4)' : 'rgba(255,110,132,0.4)'

  return (
    <motion.div className="mb-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16,1,0.3,1] }}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-label text-xs capitalize tracking-wide text-on-surface-variant/60">{label}</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${glow}` }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.07 + 0.2, duration: 0.8, ease: [0.16,1,0.3,1] }} />
      </div>
    </motion.div>
  )
}