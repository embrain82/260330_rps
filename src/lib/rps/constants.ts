// src/lib/rps/constants.ts
// Configurable game constants. All probability values and thresholds are here.

// Win rate curve per D-05: index 0 = round 1, index 4 = round 5
// "Win rate" = probability that AI picks LOSES_TO[playerChoice] (AI loses → player wins) per D-07
export const WIN_RATE_TABLE = [0.85, 0.75, 0.65, 0.55, 0.30] as const

// Per D-02: each consecutive draw in a round increases effective win rate by this amount
export const DRAW_BONUS_PCT = 0.05

// Per D-03: after this many consecutive draws in a round, player auto-wins the round
export const MAX_DRAW_AUTO_WIN = 3

// Total rounds needed to win the game (reach victory)
export const TOTAL_ROUNDS = 5
