'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { IdleScreen } from '@/components/screens/IdleScreen'
import { PlayScreen } from '@/components/screens/PlayScreen'
import { ResultScreen } from '@/components/screens/ResultScreen'
import { VictoryConfetti } from '@/components/effects/Confetti'
import { DefeatEffect } from '@/components/effects/DefeatEffect'

export default function Game() {
  const phase = useGameStore((s) => s.phase)
  const lastOutcome = useGameStore((s) => s.lastOutcome)
  const advance = useGameStore((s) => s.advance)

  // Auto-advance timer logic (D-11 timing)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear any existing timer on phase change
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (phase === 'result' && lastOutcome) {
      const delay = lastOutcome === 'draw' ? 800 : 1000
      timerRef.current = setTimeout(() => {
        advance()
      }, delay)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [phase, lastOutcome, advance])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <IdleScreen />
          </motion.div>
        )}

        {(phase === 'selecting' || phase === 'revealing' || phase === 'result') && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <PlayScreen />
          </motion.div>
        )}

        {phase === 'victory' && (
          <motion.div
            key="victory"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative"
          >
            <ResultScreen />
            <VictoryConfetti />
          </motion.div>
        )}

        {phase === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <DefeatEffect>
              <ResultScreen />
            </DefeatEffect>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
