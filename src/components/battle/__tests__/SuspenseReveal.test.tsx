import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { initialState, useGameStore } from '@/store/gameStore'

// Mock useAnimate to avoid animation errors in jsdom
vi.mock('motion/react', async () => {
  const actual = await vi.importActual('motion/react')
  return {
    ...actual,
    useAnimate: () => [
      { current: document.createElement('div') },
      vi.fn().mockResolvedValue(undefined),
    ],
  }
})

// Import after mock
import { SuspenseReveal } from '@/components/battle/SuspenseReveal'

describe('SuspenseReveal', () => {
  beforeEach(() => {
    useGameStore.setState(initialState)
  })

  it('renders container with preserve-3d transform style', () => {
    const { container } = render(<SuspenseReveal aiChoice="rock" />)
    const card = container.querySelector('[data-testid="suspense-card"]')
    expect(card).toBeTruthy()
    expect((card as HTMLElement).style.transformStyle).toBe('preserve-3d')
  })

  it('renders two face divs with backfaceVisibility hidden', () => {
    const { container } = render(<SuspenseReveal aiChoice="rock" />)
    const front = container.querySelector('[data-testid="card-front"]')
    const back = container.querySelector('[data-testid="card-back"]')
    expect(front).toBeTruthy()
    expect(back).toBeTruthy()
    expect((front as HTMLElement).style.backfaceVisibility).toBe('hidden')
    expect((back as HTMLElement).style.backfaceVisibility).toBe('hidden')
  })

  it('back face is pre-rotated 180deg', () => {
    const { container } = render(<SuspenseReveal aiChoice="rock" />)
    const back = container.querySelector('[data-testid="card-back"]')
    expect(back).toBeTruthy()
    expect((back as HTMLElement).style.transform).toContain('rotateY(180deg)')
  })

  it('back face shows all three choice icons', () => {
    const { container } = render(<SuspenseReveal aiChoice="rock" />)
    const back = container.querySelector('[data-testid="card-back"]')
    expect(back).toBeTruthy()
    // Check for all 3 SVG icons by aria-label
    const svgs = back!.querySelectorAll('svg[role="img"]')
    const labels = Array.from(svgs).map((svg) => svg.getAttribute('aria-label'))
    expect(labels).toContain('바위')
    expect(labels).toContain('보')
    expect(labels).toContain('가위')
  })

  it('front face shows the AI choice icon', () => {
    const { container } = render(<SuspenseReveal aiChoice="rock" />)
    const front = container.querySelector('[data-testid="card-front"]')
    expect(front).toBeTruthy()
    const svg = front!.querySelector('svg[aria-label="바위"]')
    expect(svg).toBeTruthy()
  })
})
