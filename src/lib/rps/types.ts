// src/lib/rps/types.ts
// All game type definitions for RPS Challenge.
// Consumed by lib/rps/* functions and Phase 2 React components.

export type Choice = 'scissors' | 'rock' | 'paper'
export type Outcome = 'win' | 'lose' | 'draw'

// FSM phases per D-10: idle → selecting → revealing → result → (gameover | victory)
export type Phase =
  | 'idle'
  | 'selecting'
  | 'revealing'
  | 'result'
  | 'gameover'
  | 'victory'

// Lookup: what does each choice beat?
// rock beats scissors, paper beats rock, scissors beats paper
export const BEATS: Record<Choice, Choice> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
}

// Lookup: what choice loses to each choice?
// scissors loses to rock (rock beats scissors), rock loses to paper, paper loses to scissors
export const LOSES_TO: Record<Choice, Choice> = {
  scissors: 'rock',   // rock beats scissors → to make player win, AI picks LOSES_TO[playerChoice]
  rock: 'paper',      // paper beats rock
  paper: 'scissors',  // scissors beats paper
}

// Per D-08: round record stored in session payload
export interface RoundRecord {
  roundNumber: number    // 1-based for display (round = index + 1)
  playerChoice: Choice
  aiChoice: Choice
  outcome: Outcome
  drawCount: number      // consecutive draws before this round resolved
}

// Per D-08: full session payload for postMessage win event
export interface SessionPayload {
  sessionId: string      // UUID v4 via crypto.randomUUID()
  rounds: RoundRecord[]
  startedAt: string      // ISO 8601 timestamp
  completedAt: string    // ISO 8601 timestamp (empty string until game ends)
  totalPlayTimeMs: number
}

// Per D-02: Coupon data structure from parent window
export interface CouponConfig {
  couponCode: string
  couponImage?: string
  couponText?: string
}

// Per D-01: Inbound message from parent
export interface RpsCouponConfigMessage {
  type: 'RPS_COUPON_CONFIG'
  couponCode: string
  couponImage?: string
  couponText?: string
}

// Per D-06/D-07: Outbound message to parent
export interface RpsGameWinMessage {
  type: 'RPS_GAME_WIN'
  payload: SessionPayload
}

// Live game state — consumed by Phase 2 useReducer
export interface GameState {
  phase:        Phase
  session:      SessionPayload
  round:        number          // 0-indexed: round 1 = index 0, round 5 = index 4
  drawCount:    number          // consecutive draws in the CURRENT round (resets on round advance)
  playerChoice: Choice | null   // set by SELECT action; null until player chooses (GAME-03: both choices revealed simultaneously)
  aiChoice:     Choice | null   // set by SELECT action alongside playerChoice; null until SELECT fires (GAME-03)
  lastOutcome:  Outcome | null
}

// FSM action types per D-10, D-12
export type GameAction =
  | { type: 'START' }
  | { type: 'SELECT'; choice: Choice }
  | { type: 'REVEAL_DONE' }
  | { type: 'ADVANCE' }         // called after result display — transitions based on outcome
  | { type: 'RETRY' }           // resets from gameover or victory back to idle (GAME-08)
