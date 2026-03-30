import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlayScreen } from '@/components/screens/PlayScreen'
import { initialState, useGameStore } from '@/store/gameStore'

describe('PlayScreen', () => {
  beforeEach(() => {
    useGameStore.setState(initialState)
  })

  it('renders the result flash during result phase without throwing', () => {
    useGameStore.setState({
      ...initialState,
      phase: 'result',
      round: 0,
      playerChoice: 'rock',
      aiChoice: 'scissors',
      lastOutcome: 'win',
    })

    expect(() => render(<PlayScreen />)).not.toThrow()
    expect(screen.getByText('승리!')).toBeTruthy()
  })
})
