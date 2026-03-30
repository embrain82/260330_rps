// src/lib/rps/gameRules.ts
// Pure function: determines the outcome of a round from two choices.
// No randomness. No side effects.
import { Choice, Outcome, BEATS } from './types'

/**
 * Determines the outcome of a round from the player's perspective.
 * @param playerChoice - The choice made by the human player
 * @param aiChoice - The choice made by the AI
 * @returns 'win' | 'lose' | 'draw' from the player's perspective
 */
export function determineOutcome(playerChoice: Choice, aiChoice: Choice): Outcome {
  if (playerChoice === aiChoice) return 'draw'
  // If AI's choice beats the player's choice, player loses
  if (BEATS[aiChoice] === playerChoice) return 'lose'
  // Otherwise player wins (player's choice beats AI's choice)
  return 'win'
}
