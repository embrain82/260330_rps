'use client'

import { motion } from 'motion/react'
import { useGameStore } from '@/store/gameStore'
import { ChoiceButton } from '@/components/ui/ChoiceButton'
import { ChoiceCard } from '@/components/battle/ChoiceCard'
import { SuspenseReveal } from '@/components/battle/SuspenseReveal'
import { RoundIndicator } from '@/components/battle/RoundIndicator'
import type { Choice, Outcome } from '@/lib/rps'

const ROUND_BG_COLORS = ['#4A90D9', '#2CA5A5', '#E8B84A', '#E87E3A', '#D94040'] as const

const RESULT_CONFIG: Record<Outcome, { text: string; color: string }> = {
  win: { text: '승리!', color: '#22C55E' },
  lose: { text: '패배...', color: '#EF4444' },
  draw: { text: '무승부! 다시!', color: '#EAB308' },
}

function ResultFlash({ outcome }: { outcome: Outcome }) {
  const config = RESULT_CONFIG[outcome]

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <motion.div
        className="rounded-2xl px-8 py-4"
        style={{ backgroundColor: config.color }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: [0, 1.2, 1] }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <span className="text-2xl font-bold text-white">{config.text}</span>
      </motion.div>
    </div>
  )
}

export function PlayScreen() {
  const phase = useGameStore((s) => s.phase)
  const round = useGameStore((s) => s.round)
  const playerChoice = useGameStore((s) => s.playerChoice)
  const aiChoice = useGameStore((s) => s.aiChoice)
  const lastOutcome = useGameStore((s) => s.lastOutcome)
  const roundResults = useGameStore((s) => s.roundResults)
  const select = useGameStore((s) => s.select)

  const completedRounds = roundResults.length
  const isRevealed = phase === 'result'

  return (
    <div
      className="relative flex flex-col min-h-screen transition-colors duration-500"
      style={{ backgroundColor: ROUND_BG_COLORS[round] }}
    >
      {/* Top section: round indicator */}
      <div className="flex items-center justify-center pt-8 pb-4 px-4">
        <RoundIndicator currentRound={round} completedRounds={completedRounds} />
      </div>

      {/* Middle section: battle area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center gap-4">
          {/* Player card */}
          <ChoiceCard choice={playerChoice} revealed={playerChoice !== null} side="player" />

          {/* VS separator */}
          <span className="text-xl font-bold text-white">VS</span>

          {/* AI card -- SuspenseReveal during revealing, ChoiceCard otherwise */}
          {phase === 'revealing' ? (
            <SuspenseReveal aiChoice={aiChoice} />
          ) : (
            <ChoiceCard choice={aiChoice} revealed={isRevealed} side="ai" />
          )}
        </div>
      </div>

      {/* Result text overlay (when phase === 'result') */}
      {phase === 'result' && lastOutcome && (
        <ResultFlash outcome={lastOutcome} />
      )}

      {/* Bottom bar: choice buttons */}
      <div className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom)] bg-black/10 backdrop-blur-sm px-4 pt-4 pb-4">
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {(['scissors', 'rock', 'paper'] as Choice[]).map((c) => (
            <ChoiceButton
              key={c}
              choice={c}
              onSelect={select}
              disabled={phase !== 'selecting'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
