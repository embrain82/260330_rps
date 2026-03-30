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

      const defaults = {
        particleCount: 50,
        spread: 80,
        startVelocity: 45,
        gravity: 1.2,
        ticks: 250,
        disableForReducedMotion: true,
        useWorker: true,
      }

      // Burst 1: center (0ms)
      confetti({
        ...defaults,
        origin: { x: 0.5, y: 0.7 },
      })

      // Burst 2: left (400ms)
      timerIds.current.push(
        setTimeout(() => {
          confetti({
            ...defaults,
            origin: { x: 0.1, y: 0.8 },
            angle: 60,
          })
        }, 400)
      )

      // Burst 3: right (800ms)
      timerIds.current.push(
        setTimeout(() => {
          confetti({
            ...defaults,
            origin: { x: 0.9, y: 0.8 },
            angle: 120,
          })
        }, 800)
      )

      // Burst 4: center wave 2 (1200ms)
      timerIds.current.push(
        setTimeout(() => {
          confetti({
            ...defaults,
            particleCount: 80,
            origin: { x: 0.5, y: 0.5 },
          })
        }, 1200)
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
