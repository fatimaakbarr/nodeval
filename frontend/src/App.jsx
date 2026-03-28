import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Evaluator from './pages/Evaluator'
import Safety from './pages/Safety'
import Batch from './pages/Batch'
import RedTeam from './pages/RedTeam'
import History from './pages/History'

const pages = {
  evaluator: <Evaluator />,
  safety: <Safety />,
  batch: <Batch />,
  redteam: <RedTeam />,
  history: <History />,
}

export default function App() {
  const [activePage, setActivePage] = useState('evaluator')
  const cursorRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const ring = ringRef.current
    let ringX = 0, ringY = 0
    let curX = 0, curY = 0

    const move = e => {
      curX = e.clientX; curY = e.clientY
      if (cursor) {
        cursor.style.left = curX + 'px'
        cursor.style.top = curY + 'px'
      }
    }

    const animateRing = () => {
      ringX += (curX - ringX) * 0.12
      ringY += (curY - ringY) * 0.12
      if (ring) {
        ring.style.left = ringX + 'px'
        ring.style.top = ringY + 'px'
      }
      requestAnimationFrame(animateRing)
    }

    window.addEventListener('mousemove', move)
    animateRing()
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-hidden relative dark">

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Custom cursor */}
      <div id="custom-cursor" ref={cursorRef} />
      <div id="cursor-ring" ref={ringRef} />

      {/* Ambient glows */}
      <div className="ambient-glow w-[700px] h-[700px] bg-primary/8"
        style={{ top: '-200px', left: '-150px' }} />
      <div className="ambient-glow w-[500px] h-[500px] bg-secondary/6"
        style={{ bottom: '-150px', right: '-100px' }} />

      {/* Sidebar */}
      <div className="relative z-10 flex-shrink-0">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-full"
          >
            {pages[activePage]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}