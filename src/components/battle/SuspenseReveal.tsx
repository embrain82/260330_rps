'use client'

import { useEffect, useState } from 'react'
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

function MysteryIcons({ bg }: { bg: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center rounded-2xl ${bg}`}>
      <div className="flex gap-1">
        <RockIcon className="w-6 h-6 text-white/80" />
        <PaperIcon className="w-6 h-6 text-white/80" />
        <ScissorsIcon className="w-6 h-6 text-white/80" />
      </div>
    </div>
  )
}

interface SuspenseRevealProps {
  aiChoice: Choice | null
}

export function SuspenseReveal({ aiChoice }: SuspenseRevealProps) {
  const revealDone = useGameStore((s) => s.revealDone)
  const [scope, animate] = useAnimate()
  const [isRevealed, setIsRevealed] = useState(false)

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
      // Phase 3: Final reveal snap (0.3s) -- land on front face (1080 = 3 full rotations)
      await animate(
        scope.current,
        { rotateY: 1080, scale: [0.8, 1.1, 1] },
        { duration: 0.3, ease: 'easeOut' }
      )
      // Swap content to AI choice AFTER animation completes
      setIsRevealed(true)
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
          data-testid="suspense-card"
          className="relative w-28 h-36 rounded-2xl shadow-xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front face: mystery during rotation, AI choice after reveal */}
          <div
            data-testid="card-front"
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {isRevealed && Icon ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white">
                <Icon className="w-16 h-16" />
              </div>
            ) : (
              <MysteryIcons bg="bg-[#FF6B6B]" />
            )}
          </div>

          {/* Back face: always mystery icons */}
          <div
            data-testid="card-back"
            className="absolute inset-0 rounded-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <MysteryIcons bg="bg-[#FF6B6B]" />
          </div>
        </div>
      </div>
    </div>
  )
}
