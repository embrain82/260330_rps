'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useGameStore } from '@/store/gameStore'

export function VictoryConfetti() {
  const phase = useGameStore((s) => s.phase)
  const hasFired = useRef(false)
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (phase === 'victory' && !hasFired.current) {
      hasFired.current = true

      // Delay all bursts so confetti fires AFTER the parent motion.div
      // entry animation completes (spring duration: 0.5s = 500ms).
      // Without this, particles render while the screen is still at opacity 0.
      const ENTRY_DELAY = 500

      const defaults = {
        particleCount: 50,
        spread: 80,
        startVelocity: 45,
        gravity: 1.2,
        ticks: 250,
        disableForReducedMotion: true,
        useWorker: true,
      }

      // Burst 1: center (ENTRY_DELAY + 0ms)
      timerIds.current.push(
        setTimeout(() => {
          confetti({
            ...defaults,
            origin: { x: 0.5, y: 0.7 },
          })
        }, ENTRY_DELAY)
      )

      // Burst 2: left (ENTRY_DELAY + 400ms)
      timerIds.current.push(
        setTimeout(() => {
          confetti({
            ...defaults,
            origin: { x: 0.1, y: 0.8 },
            angle: 60,
          })
        }, ENTRY_DELAY + 400)
      )

      // Burst 3: right (ENTRY_DELAY + 800ms)
      timerIds.current.push(
        setTimeout(() => {
          confetti({
            ...defaults,
            origin: { x: 0.9, y: 0.8 },
            angle: 120,
          })
        }, ENTRY_DELAY + 800)
      )

      // Burst 4: center wave 2 (ENTRY_DELAY + 1200ms)
      timerIds.current.push(
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 80,
            origin: { x: 0.5, y: 0.5 },
          })
        }, ENTRY_DELAY + 1200)
      )
    }

    // Reset hasFired when phase leaves victory (so it can fire again after retry)
    if (phase !== 'victory') {
      hasFired.current = false
    }

    return () => {
      confetti.reset()
      timerIds.current.forEach(clearTimeout)
      timerIds.current = []
    }
  }, [phase])

  // canvas-confetti creates its own canvas element
  return null
}
