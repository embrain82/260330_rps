// src/lib/rps/__tests__/aiEngine.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { pickAiChoice } from '../aiEngine'
import { BEATS, LOSES_TO } from '../types'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('pickAiChoice — player wins path (roll below win rate)', () => {
  it('round 1 (index 0), drawCount 0: roll 0.0 → AI picks BEATS[playerChoice] (player wins)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    const result = pickAiChoice(0, 'rock', 0)
    // BEATS['rock'] = 'scissors'. AI picks scissors. Rock beats scissors → player wins.
    expect(result).toBe(BEATS['rock'])  // 'scissors'
  })
  it('round 5 (index 4), drawCount 0: roll 0.29 (below 0.30) → player wins', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.29)
    const result = pickAiChoice(4, 'scissors', 0)
    // BEATS['scissors'] = 'paper'. AI picks paper. Scissors beats paper → player wins.
    expect(result).toBe(BEATS['scissors'])  // 'paper'
  })
})

describe('pickAiChoice — non-win paths (roll above win rate)', () => {
  it('roll above win rate, subRoll < 0.5 → draw (AI picks playerChoice)', () => {
    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValueOnce(0.999)   // first call: above win rate
    mockRandom.mockReturnValueOnce(0.0)     // second call: subRoll < 0.5 → draw
    const result = pickAiChoice(0, 'rock', 0)
    expect(result).toBe('rock')  // same as player = draw
  })
  it('roll above win rate, subRoll >= 0.5 → AI wins (AI picks LOSES_TO[playerChoice])', () => {
    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValueOnce(0.999)   // first call: above win rate
    mockRandom.mockReturnValueOnce(0.999)   // second call: subRoll >= 0.5 → AI wins
    const result = pickAiChoice(0, 'rock', 0)
    // LOSES_TO['rock'] = 'paper'. AI picks paper. Paper beats rock → AI wins.
    expect(result).toBe(LOSES_TO['rock'])  // 'paper'
  })
})

describe('pickAiChoice — draw bonus (D-02)', () => {
  it('round 2 (index 1), drawCount=1: effective rate is 0.80, roll 0.79 → player wins', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.79)
    const result = pickAiChoice(1, 'paper', 1)
    // 0.79 < 0.80 effective rate → player wins path → AI picks BEATS['paper'] = 'rock'
    expect(result).toBe(BEATS['paper'])  // 'rock'
  })
  it('round 2 (index 1), drawCount=1: roll 0.81 (above 0.80) → non-win path', () => {
    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValueOnce(0.81)  // above effective rate
    mockRandom.mockReturnValueOnce(0.0)   // subRoll → draw
    const result = pickAiChoice(1, 'rock', 1)
    // Roll is above effective rate (0.80), so NOT in player-wins path
    expect(result).not.toBe(BEATS['rock'])  // not the player-wins choice ('scissors')
  })
})

describe('pickAiChoice — auto-win (D-03): 3 consecutive draws', () => {
  it('drawCount=3 returns BEATS[playerChoice] WITHOUT calling Math.random', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    const result = pickAiChoice(2, 'rock', 3)
    expect(randomSpy).not.toHaveBeenCalled()  // Guard clause must fire before any random call
    expect(result).toBe(BEATS['rock'])  // 'scissors' — rock beats scissors → player wins
  })
  it('drawCount=4 (above threshold) also returns BEATS[playerChoice] without Math.random', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    const result = pickAiChoice(0, 'scissors', 4)
    expect(randomSpy).not.toHaveBeenCalled()
    expect(result).toBe(BEATS['scissors'])  // 'paper' — scissors beats paper → player wins
  })
})

describe('pickAiChoice — off-by-one guard (round 5)', () => {
  it('round 5 (index 4) uses WIN_RATE_TABLE[4]=0.30, not undefined', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.29)  // below 0.30
    const result = pickAiChoice(4, 'paper', 0)
    // Should be player-wins path
    expect(result).toBe(BEATS['paper'])  // 'rock'
    expect(result).not.toBeUndefined()
  })
})
