// src/lib/rps/session.ts
// Session management: create and finalize game sessions.
// Uses crypto.randomUUID() built-in — no uuid package needed (Node 14.17+ / Chrome 92+).
// SessionPayload shape is the postMessage contract for Phase 3 integration.
import { SessionPayload } from './types'

/**
 * Creates a new game session with a UUID v4 sessionId and ISO start timestamp.
 * Called when the player presses START (transitions idle → selecting).
 */
export function createSession(): SessionPayload {
  return {
    sessionId: crypto.randomUUID(),
    rounds: [],
    startedAt: new Date().toISOString(),
    completedAt: '',
    totalPlayTimeMs: 0,
  }
}

/**
 * Finalizes a session with end time and computed duration.
 * Returns a NEW object — does not mutate the input.
 * Called on gameover or victory before emitting postMessage.
 *
 * @param session - The active session created by createSession()
 * @param endTime - The Date at which the game ended
 */
export function finalizeSession(
  session: SessionPayload,
  endTime: Date
): SessionPayload {
  return {
    ...session,
    completedAt: endTime.toISOString(),
    totalPlayTimeMs: endTime.getTime() - new Date(session.startedAt).getTime(),
  }
}
