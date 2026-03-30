// src/lib/rps/__tests__/types.test.ts
import { describe, it, expect } from 'vitest'
import {
  BEATS,
  LOSES_TO,
  type Choice,
  type Outcome,
  type Phase,
} from '../types'
import {
  WIN_RATE_TABLE,
  DRAW_BONUS_PCT,
  MAX_DRAW_AUTO_WIN,
  TOTAL_ROUNDS,
} from '../constants'

describe('BEATS lookup', () => {
  it('rock beats scissors', () => {
    expect(BEATS['rock']).toBe('scissors')
  })
  it('paper beats rock', () => {
    expect(BEATS['paper']).toBe('rock')
  })
  it('scissors beats paper', () => {
    expect(BEATS['scissors']).toBe('paper')
  })
})

describe('LOSES_TO lookup (AI loses → player wins)', () => {
  it('to beat scissors, AI picks rock (rock beats scissors)', () => {
    expect(LOSES_TO['scissors']).toBe('rock')
  })
  it('to beat rock, AI picks paper (paper beats rock)', () => {
    expect(LOSES_TO['rock']).toBe('paper')
  })
  it('to beat paper, AI picks scissors (scissors beats paper)', () => {
    expect(LOSES_TO['paper']).toBe('scissors')
  })
})

describe('WIN_RATE_TABLE constants', () => {
  it('round 1 (index 0) win rate is 0.85', () => {
    expect(WIN_RATE_TABLE[0]).toBe(0.85)
  })
  it('round 2 (index 1) win rate is 0.75', () => {
    expect(WIN_RATE_TABLE[1]).toBe(0.75)
  })
  it('round 3 (index 2) win rate is 0.65', () => {
    expect(WIN_RATE_TABLE[2]).toBe(0.65)
  })
  it('round 4 (index 3) win rate is 0.55', () => {
    expect(WIN_RATE_TABLE[3]).toBe(0.55)
  })
  it('round 5 (index 4) win rate is 0.30', () => {
    expect(WIN_RATE_TABLE[4]).toBe(0.30)
  })
  it('table has exactly 5 entries (no off-by-one)', () => {
    expect(WIN_RATE_TABLE.length).toBe(5)
  })
})

describe('Draw bonus and auto-win constants', () => {
  it('DRAW_BONUS_PCT is 0.05', () => {
    expect(DRAW_BONUS_PCT).toBe(0.05)
  })
  it('MAX_DRAW_AUTO_WIN is 3', () => {
    expect(MAX_DRAW_AUTO_WIN).toBe(3)
  })
  it('TOTAL_ROUNDS is 5', () => {
    expect(TOTAL_ROUNDS).toBe(5)
  })
})
