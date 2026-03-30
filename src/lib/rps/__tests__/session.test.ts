// src/lib/rps/__tests__/session.test.ts
import { describe, it, expect } from 'vitest'
import { createSession, finalizeSession } from '../session'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

describe('createSession()', () => {
  it('returns a UUID v4 sessionId', () => {
    const session = createSession()
    expect(session.sessionId).toMatch(UUID_V4_REGEX)
  })
  it('generates a unique sessionId each call', () => {
    const s1 = createSession()
    const s2 = createSession()
    expect(s1.sessionId).not.toBe(s2.sessionId)
  })
  it('startedAt is an ISO 8601 timestamp string', () => {
    const session = createSession()
    expect(session.startedAt).toMatch(ISO_8601_REGEX)
  })
  it('rounds array is empty', () => {
    const session = createSession()
    expect(session.rounds).toEqual([])
  })
  it('completedAt is an empty string (not yet finalized)', () => {
    const session = createSession()
    expect(session.completedAt).toBe('')
  })
  it('totalPlayTimeMs is 0 (not yet finalized)', () => {
    const session = createSession()
    expect(session.totalPlayTimeMs).toBe(0)
  })
})

describe('finalizeSession()', () => {
  it('sets completedAt to endTime ISO string', () => {
    const session = createSession()
    const endTime = new Date()
    const finalized = finalizeSession(session, endTime)
    expect(finalized.completedAt).toBe(endTime.toISOString())
  })
  it('computes totalPlayTimeMs correctly', () => {
    const session = createSession()
    // Override startedAt to a known time for deterministic test
    const startTime = new Date('2026-01-01T00:00:00.000Z')
    const endTime = new Date('2026-01-01T00:00:05.000Z')
    const sessionWithKnownStart = { ...session, startedAt: startTime.toISOString() }
    const finalized = finalizeSession(sessionWithKnownStart, endTime)
    expect(finalized.totalPlayTimeMs).toBe(5000)
  })
  it('does NOT mutate the original session (completedAt stays empty)', () => {
    const session = createSession()
    const endTime = new Date()
    finalizeSession(session, endTime)
    expect(session.completedAt).toBe('')  // original unchanged
  })
  it('preserves all original fields (sessionId, rounds, startedAt)', () => {
    const session = createSession()
    const endTime = new Date()
    const finalized = finalizeSession(session, endTime)
    expect(finalized.sessionId).toBe(session.sessionId)
    expect(finalized.rounds).toEqual(session.rounds)
    expect(finalized.startedAt).toBe(session.startedAt)
  })
})
