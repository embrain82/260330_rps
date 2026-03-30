'use client'

import { useEffect } from 'react'
import { useAnimate } from 'motion/react'
import { useGameStore } from '@/store/gameStore'
import { RockIcon } from '@/components/svg/Rock'
import { PaperIcon } from '@/components/svg/Paper'
import { ScissorsIcon } from '@/components/svg/Scissors'
import type { Choice } from '@/lib/rps'

const CHOICE_ICONS: Record<Choice, React.ComponentType<{ className?: string }>> = {
  rock: RockIcon,
  paper: PaperIcon,
  scissors: ScissorsIcon,
}

interface SuspenseRevealProps {
  aiChoice: Choice | null
}

export function SuspenseReveal({ aiChoice }: SuspenseRevealProps) {
  const revealDone = useGameStore((s) => s.revealDone)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const runSuspense = async () => {
      // Phase 1: Fast shuffle (0.6s) -- rapid card flips
      await animate(
        scope.current,
        { rotateY: [0, 360, 720] },
        { duration: 0.6, ease: 'linear' }
      )
      // Phase 2: Deceleration (0.6s) -- slowing down
      await animate(
        scope.current,
        { rotateY: [720, 900] },
        { duration: 0.6, ease: 'easeOut' }
      )
      // Phase 3: Final reveal snap (0.3s) -- spring into place
      await animate(
        scope.current,
        { rotateY: 0, scale: [0.8, 1.1, 1] },
        { duration: 0.3, ease: 'easeOut' }
      )
      // Signal store that reveal animation is done
      revealDone()
    }
    runSuspense()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // runs once on mount -- PlayScreen only mounts this during 'revealing'

  const Icon = aiChoice ? CHOICE_ICONS[aiChoice] : null

  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-normal text-white mb-2">AI</span>
      <div style={{ perspective: 600 }}>
        <div
          ref={scope}
          className="flex items-center justify-center w-28 h-36 rounded-2xl bg-white shadow-xl"
        >
          {Icon && <Icon className="w-16 h-16" />}
        </div>
      </div>
    </div>
  )
}
