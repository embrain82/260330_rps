import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGameStore, initialState } from '@/store/gameStore'

describe('Zustand game store FSM transitions', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.setState(initialState)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('start() transitions phase from idle to selecting and creates new session', () => {
    const { start } = useGameStore.getState()
    start()
    const state = useGameStore.getState()

    expect(state.phase).toBe('selecting')
    expect(state.round).toBe(0)
    expect(state.drawCount).toBe(0)
    expect(state.session.sessionId).toBeTruthy()
    expect(state.session.startedAt).toBeTruthy()
    expect(state.session.rounds).toEqual([])
  })

  it('session.sessionId changes on start() (new session each game)', () => {
    const { start, retry } = useGameStore.getState()
    start()
    const firstId = useGameStore.getState().session.sessionId
    retry()
    useGameStore.getState().start()
    const secondId = useGameStore.getState().session.sessionId

    expect(firstId).toBeTruthy()
    expect(secondId).toBeTruthy()
    expect(firstId).not.toBe(secondId)
  })

  it('select(choice) transitions from selecting to revealing with both choices set', () => {
    // Make AI pick the losing choice (player wins) by rolling below win rate
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // below 0.85 for round 0

    const { start } = useGameStore.getState()
    start()
    useGameStore.getState().select('rock')
    const state = useGameStore.getState()

    expect(state.phase).toBe('revealing')
    expect(state.playerChoice).toBe('rock')
    expect(state.aiChoice).not.toBeNull()
  })

  it('revealDone() transitions from revealing to result and sets lastOutcome', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // player wins

    useGameStore.getState().start()
    useGameStore.getState().select('rock')
    useGameStore.getState().revealDone()
    const state = useGameStore.getState()

    expect(state.phase).toBe('result')
    expect(state.lastOutcome).not.toBeNull()
  })

  it('advance() after win transitions to selecting with round+1 when round < 4', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // player wins

    useGameStore.getState().start()
    useGameStore.getState().select('rock')
    useGameStore.getState().revealDone()

    expect(useGameStore.getState().lastOutcome).toBe('win')

    useGameStore.getState().advance()
    const state = useGameStore.getState()

    expect(state.phase).toBe('selecting')
    expect(state.round).toBe(1)
    expect(state.drawCount).toBe(0)
    expect(state.playerChoice).toBeNull()
    expect(state.aiChoice).toBeNull()
    expect(state.lastOutcome).toBeNull()
    expect(state.roundResults).toHaveLength(1)
    expect(state.roundResults[0]).toEqual({ outcome: 'win', round: 0 })
  })

  it('advance() after win on round 4 (index 4) transitions to victory', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.01) // always player wins

    useGameStore.getState().start()

    // Play through rounds 0-4 (all wins)
    for (let round = 0; round < 5; round++) {
      useGameStore.getState().select('rock')
      useGameStore.getState().revealDone()
      expect(useGameStore.getState().lastOutcome).toBe('win')
      useGameStore.getState().advance()
    }

    const state = useGameStore.getState()
    expect(state.phase).toBe('victory')
    expect(state.roundResults).toHaveLength(5)
    expect(state.session.completedAt).toBeTruthy()
    expect(state.session.completedAt).not.toBe('')

    randomSpy.mockRestore()
  })

  it('advance() after lose transitions to gameover', () => {
    // Force a loss: roll above win rate, then subroll >= 0.5 (AI wins)
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99) // above 0.85 → non-win path
      .mockReturnValueOnce(0.99) // subRoll >= 0.5 → AI wins

    useGameStore.getState().start()
    useGameStore.getState().select('rock')
    useGameStore.getState().revealDone()

    expect(useGameStore.getState().lastOutcome).toBe('lose')

    useGameStore.getState().advance()
    const state = useGameStore.getState()

    expect(state.phase).toBe('gameover')
    expect(state.roundResults).toHaveLength(1)
    expect(state.roundResults[0]).toEqual({ outcome: 'lose', round: 0 })
    expect(state.session.completedAt).toBeTruthy()
    expect(state.session.completedAt).not.toBe('')
  })

  it('advance() after draw transitions to selecting with same round and drawCount+1', () => {
    // Force a draw: roll above win rate, subRoll < 0.5 (draw)
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99) // above win rate
      .mockReturnValueOnce(0.1)  // subRoll < 0.5 → draw

    useGameStore.getState().start()
    useGameStore.getState().select('rock')
    useGameStore.getState().revealDone()

    expect(useGameStore.getState().lastOutcome).toBe('draw')

    useGameStore.getState().advance()
    const state = useGameStore.getState()

    expect(state.phase).toBe('selecting')
    expect(state.round).toBe(0) // same round
    expect(state.drawCount).toBe(1) // incremented
    expect(state.playerChoice).toBeNull()
    expect(state.aiChoice).toBeNull()
    expect(state.lastOutcome).toBeNull()
    expect(state.roundResults).toHaveLength(0) // draw doesn't add to results
  })

  it('retry() resets all state to initial (phase=idle, round=0)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)

    useGameStore.getState().start()
    useGameStore.getState().select('rock')
    useGameStore.getState().revealDone()
    useGameStore.getState().advance()

    // Verify we are NOT in initial state
    expect(useGameStore.getState().round).toBe(1)

    useGameStore.getState().retry()
    const state = useGameStore.getState()

    expect(state.phase).toBe('idle')
    expect(state.round).toBe(0)
    expect(state.drawCount).toBe(0)
    expect(state.playerChoice).toBeNull()
    expect(state.aiChoice).toBeNull()
    expect(state.lastOutcome).toBeNull()
    expect(state.roundResults).toEqual([])
  })

  it('victory/gameover sets session.completedAt to non-empty string', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.99) // above win rate
      .mockReturnValueOnce(0.99) // AI wins

    useGameStore.getState().start()
    const startedAt = useGameStore.getState().session.startedAt

    useGameStore.getState().select('rock')
    useGameStore.getState().revealDone()
    useGameStore.getState().advance()

    const state = useGameStore.getState()
    expect(state.phase).toBe('gameover')
    expect(state.session.completedAt).toBeTruthy()
    expect(typeof state.session.completedAt).toBe('string')
    expect(state.session.completedAt.length).toBeGreaterThan(0)
    expect(state.session.startedAt).toBe(startedAt)
  })
})
