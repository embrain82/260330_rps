import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useGameStore } from '@/store/gameStore'
import { ResultScreen } from '@/components/screens/ResultScreen'

describe('ResultScreen', () => {
  beforeEach(() => {
    // Reset to a clean state before each test
    useGameStore.setState({
      phase: 'idle',
      couponConfig: null,
    })
  })

  describe('victory with couponConfig', () => {
    it('displays coupon code when couponConfig has couponCode', () => {
      useGameStore.setState({
        phase: 'victory',
        couponConfig: { couponCode: 'SAVE-50' },
      })
      render(<ResultScreen />)
      expect(screen.getByText('SAVE-50')).toBeTruthy()
    })

    it('renders coupon image when couponConfig has couponImage', () => {
      useGameStore.setState({
        phase: 'victory',
        couponConfig: {
          couponCode: 'X',
          couponImage: 'https://example.com/coupon.png',
        },
      })
      render(<ResultScreen />)
      const img = screen.getByRole('img')
      expect(img.getAttribute('src')).toContain('coupon.png')
    })

    it('displays coupon text when couponConfig has couponText', () => {
      useGameStore.setState({
        phase: 'victory',
        couponConfig: { couponCode: 'X', couponText: '10% 할인' },
      })
      render(<ResultScreen />)
      expect(screen.getByText('10% 할인')).toBeTruthy()
    })

    it('renders coupon-area container when couponConfig is present', () => {
      useGameStore.setState({
        phase: 'victory',
        couponConfig: { couponCode: 'TEST-123' },
      })
      render(<ResultScreen />)
      expect(screen.getByTestId('coupon-area')).toBeTruthy()
    })
  })

  describe('victory without couponConfig', () => {
    it('displays fallback text when couponConfig is null', () => {
      useGameStore.setState({
        phase: 'victory',
        couponConfig: null,
      })
      render(<ResultScreen />)
      expect(screen.getByText('5판 연속 승리!')).toBeTruthy()
      expect(screen.queryByTestId('coupon-area')).toBeNull()
    })
  })

  describe('gameover phase', () => {
    it('shows gameover text and retry button', () => {
      useGameStore.setState({
        phase: 'gameover',
        couponConfig: null,
      })
      render(<ResultScreen />)
      expect(screen.getByText('다시 도전해보세요!')).toBeTruthy()
      expect(screen.getByRole('button')).toBeTruthy()
    })

    it('does not show coupon area or victory text in gameover', () => {
      useGameStore.setState({
        phase: 'gameover',
        couponConfig: { couponCode: 'SHOULD-NOT-SHOW' },
      })
      render(<ResultScreen />)
      expect(screen.queryByTestId('coupon-area')).toBeNull()
      expect(screen.queryByText('5판 연속 승리!')).toBeNull()
    })
  })

  describe('retry button', () => {
    it('shows retry button in victory phase', () => {
      useGameStore.setState({
        phase: 'victory',
        couponConfig: null,
      })
      render(<ResultScreen />)
      expect(screen.getByRole('button')).toBeTruthy()
    })

    it('shows retry button in gameover phase', () => {
      useGameStore.setState({
        phase: 'gameover',
        couponConfig: null,
      })
      render(<ResultScreen />)
      expect(screen.getByRole('button')).toBeTruthy()
    })
  })
})
