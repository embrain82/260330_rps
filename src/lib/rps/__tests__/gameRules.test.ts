// src/lib/rps/__tests__/gameRules.test.ts
import { describe, it, expect } from 'vitest'
import { determineOutcome } from '../gameRules'

describe('determineOutcome — all 9 RPS combinations', () => {
  // Draw cases (same choice)
  it('scissors vs scissors → draw', () => {
    expect(determineOutcome('scissors', 'scissors')).toBe('draw')
  })
  it('rock vs rock → draw', () => {
    expect(determineOutcome('rock', 'rock')).toBe('draw')
  })
  it('paper vs paper → draw', () => {
    expect(determineOutcome('paper', 'paper')).toBe('draw')
  })

  // Player wins cases
  it('scissors vs paper → win (scissors beats paper)', () => {
    expect(determineOutcome('scissors', 'paper')).toBe('win')
  })
  it('rock vs scissors → win (rock beats scissors)', () => {
    expect(determineOutcome('rock', 'scissors')).toBe('win')
  })
  it('paper vs rock → win (paper beats rock)', () => {
    expect(determineOutcome('paper', 'rock')).toBe('win')
  })

  // Player loses cases
  it('scissors vs rock → lose (rock beats scissors)', () => {
    expect(determineOutcome('scissors', 'rock')).toBe('lose')
  })
  it('rock vs paper → lose (paper beats rock)', () => {
    expect(determineOutcome('rock', 'paper')).toBe('lose')
  })
  it('paper vs scissors → lose (scissors beats paper)', () => {
    expect(determineOutcome('paper', 'scissors')).toBe('lose')
  })
})
