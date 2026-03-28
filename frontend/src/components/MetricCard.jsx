import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function AnimatedNum({ value }) {
  const [display, setDisplay] = useState(0)
  const num = parseFloat(value)
  const isNum = !isNaN(num) && !String(value).match(/[%ms]/g)?.length && !['PASS','FAIL','WARNING','N/A','—'].includes(value)

  useEffect(() => {
    if (!isNum) return
    let start = 0
    const duration = 800
    const step = 16
    const inc = (num - start) / (duration / step)
    const timer = setInterval(() => {
      start += inc
      if (start >= num) { setDisplay(num); clearInterval(timer) }
      else setDisplay(Math.round(start * 10) / 10)
    }, step)
    return () => clearInterval(timer)
  }, [value])

  return <span>{isNum ? display : value}</span>
}

export default function MetricCard({ label, value, sub, color = 'default', index = 0 }) {
  return (
    <motion.div className="glass-card rounded-[1.5rem] p-5 cursor-default group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16,1,0.3,1] }}
      whileHover={{ scale: 1.02 }}>
      <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/50 mb-3">{label}</div>
      <div className="font-headline font-extrabold text-3xl text-on-surface mb-1"><AnimatedNum value={value} /></div>
      {sub && <div className="font-label text-[10px] text-on-surface-variant/40">{sub}</div>}
    </motion.div>
  )
}