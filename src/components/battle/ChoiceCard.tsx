'use client'

import { motion } from 'motion/react'
import type { Choice } from '@/lib/rps'
import { RockIcon } from '@/components/svg/Rock'
import { PaperIcon } from '@/components/svg/Paper'
import { ScissorsIcon } from '@/components/svg/Scissors'

const CHOICE_ICONS: Record<Choice, React.ComponentType<{ className?: string }>> = {
  rock: RockIcon,
  paper: PaperIcon,
  scissors: ScissorsIcon,
}

interface ChoiceCardProps {
  choice: Choice | null
  revealed: boolean
  side: 'player' | 'ai'
}

export function ChoiceCard({ choice, revealed, side }: ChoiceCardProps) {
  const isRevealed = revealed && choice !== null
  const Icon = choice ? CHOICE_ICONS[choice] : null
  const label = side === 'player' ? '나' : 'AI'

  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-normal text-white mb-2">{label}</span>
      <div style={{ perspective: 600 }}>
        <motion.div
          className="relative w-28 h-36 rounded-2xl shadow-xl"
          animate={{ rotateY: isRevealed ? 0 : 180 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            duration: 0.3,
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Card front (visible when revealed) */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {Icon && <Icon className="w-16 h-16" />}
          </div>

          {/* Card back (visible when not revealed) */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#FF6B6B]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-4xl font-bold text-white">?</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
