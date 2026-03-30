// src/lib/rps/aiEngine.ts
// AI choice engine. Pure function — no side effects, no React imports.
// Win rate = probability AI loses (player wins). Per D-04, D-07.
import { Choice, BEATS, LOSES_TO } from './types'
import { WIN_RATE_TABLE, DRAW_BONUS_PCT, MAX_DRAW_AUTO_WIN } from './constants'

/**
 * Picks the AI's choice for a given round.
 *
 * Semantic key:
 *   BEATS[playerChoice]  = what playerChoice beats → AI picks this → player wins
 *   LOSES_TO[playerChoice] = what beats playerChoice → AI picks this → AI wins
 *
 * @param roundIndex - 0-indexed round number (round 1 = 0, round 5 = 4)
 * @param playerChoice - The choice made by the player this round
 * @param drawCount - Number of consecutive draws in the current round (resets each new round)
 * @returns The AI's Choice
 */
export function pickAiChoice(
  roundIndex: number,
  playerChoice: Choice,
  drawCount: number
): Choice {
  // D-03: Auto-win guard MUST be first — before any Math.random() call (Pitfall 2)
  if (drawCount >= MAX_DRAW_AUTO_WIN) {
    return BEATS[playerChoice]  // AI picks what player's choice beats → player wins
  }

  const baseRate = WIN_RATE_TABLE[roundIndex] ?? 0.50  // Pitfall 3: fallback for safety
  const effectiveRate = Math.min(baseRate + drawCount * DRAW_BONUS_PCT, 1.0)  // D-02

  const roll = Math.random()

  if (roll < effectiveRate) {
    // Player wins: AI picks the choice that loses to playerChoice
    // playerChoice beats BEATS[playerChoice] → BEATS[playerChoice] is what playerChoice defeats
    return BEATS[playerChoice]
  }

  // Remaining probability: 50/50 between draw and AI wins (D-04 interpretation)
  const subRoll = Math.random()
  if (subRoll < 0.5) {
    return playerChoice  // Same choice = draw
  }
  return LOSES_TO[playerChoice]  // AI picks what beats player = AI wins
}
