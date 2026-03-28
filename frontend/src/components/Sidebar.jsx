import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const NAV = [
  { id: 'evaluator', icon: 'analytics', label: 'Evaluator' },
  { id: 'batch',     icon: 'layers',    label: 'Batch' },
  { id: 'redteam',   icon: 'security',  label: 'Red Team' },
  { id: 'safety',    icon: 'verified_user', label: 'Safety' },
  { id: 'history',   icon: 'history',   label: 'History' },
]

export default function Sidebar({ activePage, setActivePage }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.aside
      className="h-screen flex flex-col py-8 bg-surface-container-low/80 backdrop-blur-xl border-r overflow-hidden relative z-40"
      style={{ borderColor: 'rgba(172,163,255,0.08)' }}
      animate={{ width: hovered ? 220 : 72 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div className="px-5 mb-10 flex items-center gap-3 overflow-hidden">
        <motion.div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 kinetic-gradient shadow-lg"
          style={{ boxShadow: '0 0 20px rgba(172,163,255,0.3)' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <span className="material-symbols-outlined text-black text-lg">network_node</span>
        </motion.div>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-headline font-black text-on-surface text-lg leading-none">Nodeval</div>
              <div className="text-[10px] font-label text-primary/60 uppercase tracking-widest">Intelligence</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.12)' }}>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ boxShadow: '0 0 6px #00d2ff' }}
          />
          <AnimatePresence>
            {hovered && (
              <motion.span
                className="text-xs font-label text-secondary/70 whitespace-nowrap"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                API connected
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV.map((item, index) => {
          const active = activePage === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-left relative overflow-hidden w-full group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + index * 0.06, duration: 0.4, ease: [0.16,1,0.3,1] }}
              whileHover={{ x: active ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Active bg */}
              {active && (
                <motion.div
                  className="absolute inset-0 rounded-xl kinetic-gradient"
                  layoutId="activeNav"
                  style={{ opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Hover bg */}
              {!active && (
                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/4 transition-colors duration-200" />
              )}

              <span
                className="material-symbols-outlined relative z-10 flex-shrink-0 text-xl"
                style={{ color: active ? '#000' : 'rgba(252,248,254,0.35)' }}
              >
                {item.icon}
              </span>

              <AnimatePresence>
                {hovered && (
                  <motion.span
                    className="font-label font-medium text-sm relative z-10 whitespace-nowrap"
                    style={{ color: active ? '#000' : 'rgba(252,248,254,0.5)' }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-full kinetic-gradient flex-shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-black">smart_toy</span>
          </div>
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-[11px] font-label text-on-surface font-bold">LLaMA 3.3</div>
                <div className="text-[9px] font-label text-primary uppercase tracking-widest">Groq Free</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}