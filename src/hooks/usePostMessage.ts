'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { RpsGameWinMessage, CouponConfig } from '@/lib/rps'

export function usePostMessage() {
  const phase = useGameStore((s) => s.phase)
  const session = useGameStore((s) => s.session)
  const setCouponConfig = useGameStore((s) => s.setCouponConfig)
  const hasSentRef = useRef(false)

  // RECEIVE: Listen for RPS_COUPON_CONFIG from parent (per D-01)
  useEffect(() => {
    const allowedOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'

    function handleMessage(event: MessageEvent) {
      // Origin validation per D-08
      if (allowedOrigin !== '*' && event.origin !== allowedOrigin) return
      if (!event.data || event.data.type !== 'RPS_COUPON_CONFIG') return

      const config: CouponConfig = {
        couponCode: event.data.couponCode,
        ...(event.data.couponImage && { couponImage: event.data.couponImage }),
        ...(event.data.couponText && { couponText: event.data.couponText }),
      }
      setCouponConfig(config)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setCouponConfig])

  // SEND: Fire RPS_GAME_WIN on victory (per D-05, D-06, D-07)
  useEffect(() => {
    if (phase !== 'victory') {
      hasSentRef.current = false
      return
    }
    if (hasSentRef.current) return
    // Guard: session must be finalized (Pitfall 1 from RESEARCH.md)
    if (!session.completedAt) return

    const targetOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*'
    const message: RpsGameWinMessage = {
      type: 'RPS_GAME_WIN',
      payload: session,
    }
    window.parent.postMessage(message, targetOrigin)
    hasSentRef.current = true
  }, [phase, session])
}
