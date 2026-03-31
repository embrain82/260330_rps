'use client'

import { useEffect, type ReactNode } from 'react'
import { useAnimate } from 'motion/react'
import { useGameStore } from '@/store/gameStore'

interface DefeatEffectProps {
  children: ReactNode
}

export function DefeatEffect({ children }: DefeatEffectProps) {
  const phase = useGameStore((s) => s.phase)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (phase === 'gameover') {
      const runDefeat = async () => {
        // Step 1: Shake (0.3s) per UI-SPEC Defeat Effect
        // delay: 0.5 syncs with parent motion.div entry animation (spring duration 0.5s)
        // so shake starts after the screen is fully opaque
        await animate(
          scope.current,
          { x: [0, -4, 4, -4, 4, -2, 2, 0] },
          { duration: 0.3, ease: 'easeOut', delay: 0.5 }
        )
        // Step 2: Desaturate (0.5s) per UI-SPEC Defeat Effect
        await animate(
          scope.current,
          { filter: ['grayscale(0%)', 'grayscale(100%)'] },
          { duration: 0.5, ease: 'easeIn' }
        )
      }
      runDefeat()
    }
  }, [phase, animate, scope])

  return <div ref={scope}>{children}</div>
}
