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

const CHOICE_LABELS: Record<Choice, string> = {
  rock: '바위',
  paper: '보',
  scissors: '가위',
}

interface ChoiceButtonProps {
  choice: Choice
  onSelect: (choice: Choice) => void
  disabled?: boolean
}

export function ChoiceButton({ choice, onSelect, disabled }: ChoiceButtonProps) {
  const Icon = CHOICE_ICONS[choice]
  const label = CHOICE_LABELS[choice]

  return (
    <motion.button
      onClick={() => onSelect(choice)}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-2 min-h-[80px] min-w-[80px] p-3 rounded-2xl bg-white shadow-lg active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <Icon className="w-10 h-10" />
      <span className="text-sm font-normal">{label}</span>
    </motion.button>
  )
}
