'use client'

import { motion } from 'motion/react'
import { TOTAL_ROUNDS } from '@/lib/rps'

interface RoundIndicatorProps {
  currentRound: number   // 0-indexed
  completedRounds: number
}

export function RoundIndicator({ currentRound, completedRounds }: RoundIndicatorProps) {
  return (
    <div
      className="flex items-center gap-1"
      role="progressbar"
      aria-valuenow={completedRounds}
      aria-valuemax={TOTAL_ROUNDS}
    >
      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
        if (i < completedRounds) {
          // Completed round: filled green dot
          return (
            <div
              key={i}
              className="w-3 h-3 rounded-full border-2 bg-green-400 border-green-500"
            />
          )
        }

        if (i === currentRound) {
          // Current round: pulsing accent dot
          return (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full border-2 border-[#FF6B6B] bg-[#FF6B6B]/50"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )
        }

        // Upcoming round: empty dot
        return (
          <div
            key={i}
            className="w-3 h-3 rounded-full border-2 border-white/40 bg-transparent"
          />
        )
      })}
      <span className="text-base font-normal text-white ml-2">
        Round {currentRound + 1}/{TOTAL_ROUNDS}
      </span>
    </div>
  )
}
