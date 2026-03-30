// src/store/gameStore.ts
// Zustand v5 game store — central FSM controller wrapping Phase 1 pure functions.
// All game logic flows through this store; components only read state and call actions.
import { create } from 'zustand'
import {
  pickAiChoice,
  determineOutcome,
  createSession,
  finalizeSession,
  TOTAL_ROUNDS,
} from '@/lib/rps'
import type { Choice, Phase, Outcome, SessionPayload } from '@/lib/rps'

interface RoundResult {
  outcome: Outcome
  round: number
}

interface GameStore {
  // State
  phase: Phase
  round: number             // 0-indexed
  drawCount: number
  playerChoice: Choice | null
  aiChoice: Choice | null
  lastOutcome: Outcome | null
  roundResults: RoundResult[]
  session: SessionPayload

  // Actions
  start: () => void
  select: (choice: Choice) => void
  revealDone: () => void
  advance: () => void
  retry: () => void
}

const emptySession: SessionPayload = {
  sessionId: '',
  rounds: [],
  startedAt: '',
  completedAt: '',
  totalPlayTimeMs: 0,
}

export const initialState: Omit<GameStore, 'start' | 'select' | 'revealDone' | 'advance' | 'retry'> = {
  phase: 'idle' as Phase,
  round: 0,
  drawCount: 0,
  playerChoice: null,
  aiChoice: null,
  lastOutcome: null,
  roundResults: [],
  session: { ...emptySession },
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  start: () => {
    const session = createSession()
    set({
      phase: 'selecting',
      round: 0,
      drawCount: 0,
      playerChoice: null,
      aiChoice: null,
      lastOutcome: null,
      roundResults: [],
      session,
    })
  },

  select: (choice: Choice) => {
    const { round, drawCount } = get()
    const aiChoice = pickAiChoice(round, choice, drawCount)
    // Atomic update: set both choices and phase in ONE set() call
    // Pitfall 1 from RESEARCH.md — prevents null reads between updates
    set({
      phase: 'revealing',
      playerChoice: choice,
      aiChoice,
    })
  },

  revealDone: () => {
    const { playerChoice, aiChoice } = get()
    if (!playerChoice || !aiChoice) return
    const outcome = determineOutcome(playerChoice, aiChoice)
    set({
      phase: 'result',
      lastOutcome: outcome,
    })
  },

  advance: () => {
    const { lastOutcome, round, session, playerChoice, aiChoice, drawCount, roundResults } = get()
    if (!lastOutcome) return

    if (lastOutcome === 'draw') {
      // Same round, increment drawCount, clear choices
      set({
        phase: 'selecting',
        drawCount: drawCount + 1,
        playerChoice: null,
        aiChoice: null,
        lastOutcome: null,
      })
      return
    }

    // Win or lose: record the round result
    const newResults = [...roundResults, { outcome: lastOutcome, round }]

    if (lastOutcome === 'lose') {
      const finalizedSession = finalizeSession(session, new Date())
      // Append round record to session
      const roundRecord = {
        roundNumber: round + 1,
        playerChoice: playerChoice!,
        aiChoice: aiChoice!,
        outcome: lastOutcome,
        drawCount,
      }
      set({
        phase: 'gameover',
        roundResults: newResults,
        session: {
          ...finalizedSession,
          rounds: [...session.rounds, roundRecord],
        },
      })
      return
    }

    // lastOutcome === 'win'
    const nextRound = round + 1
    const roundRecord = {
      roundNumber: round + 1,
      playerChoice: playerChoice!,
      aiChoice: aiChoice!,
      outcome: lastOutcome,
      drawCount,
    }
    const updatedSessionRounds = [...session.rounds, roundRecord]

    if (nextRound >= TOTAL_ROUNDS) {
      // Victory!
      const finalizedSession = finalizeSession(session, new Date())
      set({
        phase: 'victory',
        roundResults: newResults,
        session: {
          ...finalizedSession,
          rounds: updatedSessionRounds,
        },
      })
      return
    }

    // More rounds to play
    set({
      phase: 'selecting',
      round: nextRound,
      drawCount: 0,
      playerChoice: null,
      aiChoice: null,
      lastOutcome: null,
      roundResults: newResults,
      session: {
        ...session,
        rounds: updatedSessionRounds,
      },
    })
  },

  retry: () => {
    set({
      ...initialState,
      session: { ...emptySession },
      roundResults: [],
    })
  },
}))
