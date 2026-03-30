import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePostMessage } from '@/hooks/usePostMessage'
import { useGameStore, initialState } from '@/store/gameStore'
import type { SessionPayload } from '@/lib/rps'

const emptySession: SessionPayload = {
  sessionId: '',
  rounds: [],
  startedAt: '',
  completedAt: '',
  totalPlayTimeMs: 0,
}

const finalizedSession: SessionPayload = {
  sessionId: 'test-uuid-123',
  rounds: [],
  startedAt: '2026-03-30T10:00:00.000Z',
  completedAt: '2026-03-30T10:05:00.000Z',
  totalPlayTimeMs: 300000,
}

// Mock window.parent.postMessage
const postMessageSpy = vi.fn()

describe('usePostMessage', () => {
  beforeEach(() => {
    useGameStore.setState({ ...initialState, session: { ...emptySession }, couponConfig: null })
    Object.defineProperty(window, 'parent', {
      value: { postMessage: postMessageSpy },
      writable: true,
      configurable: true,
    })
    postMessageSpy.mockClear()
    // Clear any env var
    delete process.env.NEXT_PUBLIC_ALLOWED_ORIGIN
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.NEXT_PUBLIC_ALLOWED_ORIGIN
  })

  describe('SEND: RPS_GAME_WIN on victory', () => {
    it('fires RPS_GAME_WIN when phase is victory with finalized session', () => {
      // Set store to victory phase with finalized session
      useGameStore.setState({ phase: 'victory', session: finalizedSession })

      renderHook(() => usePostMessage())

      expect(postMessageSpy).toHaveBeenCalledTimes(1)
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'RPS_GAME_WIN',
          payload: finalizedSession,
        },
        '*'
      )
    })

    it('fires exactly once per victory (re-renders do not trigger duplicate sends)', () => {
      useGameStore.setState({ phase: 'victory', session: finalizedSession })

      const { rerender } = renderHook(() => usePostMessage())

      // Force re-render
      rerender()
      rerender()

      expect(postMessageSpy).toHaveBeenCalledTimes(1)
    })

    it('does not fire when phase is not victory', () => {
      useGameStore.setState({ phase: 'gameover', session: finalizedSession })

      renderHook(() => usePostMessage())

      expect(postMessageSpy).not.toHaveBeenCalled()
    })

    it('does not fire when completedAt is empty (session not finalized)', () => {
      useGameStore.setState({
        phase: 'victory',
        session: { ...finalizedSession, completedAt: '' },
      })

      renderHook(() => usePostMessage())

      expect(postMessageSpy).not.toHaveBeenCalled()
    })
  })

  describe('RECEIVE: RPS_COUPON_CONFIG from parent', () => {
    it('stores coupon config when RPS_COUPON_CONFIG message received', () => {
      renderHook(() => usePostMessage())

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'RPS_COUPON_CONFIG',
              couponCode: 'TEST-123',
              couponText: 'Discount',
            },
            origin: 'http://localhost:3000',
          })
        )
      })

      const config = useGameStore.getState().couponConfig
      expect(config).not.toBeNull()
      expect(config!.couponCode).toBe('TEST-123')
      expect(config!.couponText).toBe('Discount')
    })

    it('ignores messages with wrong type', () => {
      renderHook(() => usePostMessage())

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: { type: 'OTHER_MSG', couponCode: 'NOPE' },
            origin: 'http://localhost:3000',
          })
        )
      })

      expect(useGameStore.getState().couponConfig).toBeNull()
    })

    it('rejects messages from wrong origin when NEXT_PUBLIC_ALLOWED_ORIGIN is set', () => {
      process.env.NEXT_PUBLIC_ALLOWED_ORIGIN = 'https://allowed.com'

      renderHook(() => usePostMessage())

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'RPS_COUPON_CONFIG',
              couponCode: 'EVIL-COUPON',
            },
            origin: 'https://evil.com',
          })
        )
      })

      expect(useGameStore.getState().couponConfig).toBeNull()
    })
  })

  describe('Cleanup', () => {
    it('removes event listener on unmount', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => usePostMessage())

      unmount()

      expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function))

      removeSpy.mockRestore()
    })
  })
})
