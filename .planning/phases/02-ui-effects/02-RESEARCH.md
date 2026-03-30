# Phase 2: UI & Effects - Research

**Researched:** 2026-03-30
**Domain:** React game UI, motion animations, canvas effects, Zustand state management, mobile-first responsive layout
**Confidence:** HIGH

## Summary

Phase 2 transforms the Phase 1 pure game logic layer into a fully playable browser game. The core challenge is orchestrating FSM-driven screen transitions (idle/selecting/revealing/result/gameover/victory) with tightly-timed animations (~2.5s per round), mobile-first touch targets, and dramatic win/lose effects -- all while keeping the codebase lightweight (no game engines).

The stack is locked: motion v12 (`motion/react`) for state-driven animations, canvas-confetti for victory fireworks, Zustand v5 for client-side game state, and Tailwind CSS v4 for responsive styling. All libraries are verified current and compatible with React 19.2.x + Next.js 16.2.1. The key architectural pattern is a Zustand store that wraps Phase 1's pure functions and drives FSM transitions, with motion's `AnimatePresence` handling screen-level enter/exit animations and `useAnimate` providing imperative control for the suspense card-shuffle sequence.

**Primary recommendation:** Build a single Zustand store as the game "controller" that imports Phase 1 pure functions, drives all FSM transitions via actions, and exposes phase/round state to components. Use motion `AnimatePresence` with `mode="wait"` for screen transitions between FSM phases. Use `useAnimate` for the 1.5s suspense card-shuffle sequence. Use CSS `@keyframes` (Tailwind `@theme`) for ambient/idle animations (pulse, glow), reserving motion for state-driven transitions.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 가위/바위/보 표현은 커스텀 SVG 일러스트로 구현한다. 카툰 스타일 -- 둥글둥글한 라인, 과장된 비율, 두꺼운 웅큼한 외곽선. 캐릭터 느낌의 손 모양.
- **D-02:** 전체 톤은 밝고 탕탕한 아케이드 스타일. 선명한 색상(coral red, teal, yellow 계열), 큰 아이콘, 둥근 모서리, 큰 그림자, 탄성 있는 애니메이션.
- **D-03:** 배경은 라운드별 변화 -- 1판 차분한 블루 -> 2판 틸 -> 3판 따뜻한 옐로우 -> 4판 오렌지 -> 5판 강렬한 레드. 긴장감 상승을 배경색 그라디언트로 시각화.
- **D-04:** 시작 화면(idle)은 미니멀 -- "5판 연속 승리하면 쿠폰!" 한 줄 규칙 설명 + 큰 시작하기 버튼. 승률 커브 미표시.
- **D-05:** 가위/바위/보 선택 버튼은 화면 하단 고정 3열 배치. 위쪽에 라운드 정보 + 대결 영역(Player vs AI). 모바일 엄지 닿기 쉬운 bottom bar 패턴.
- **D-06:** 라운드 진행 상황은 스텝 돈 형태로 표시. 승리한 라운드는 채워지고, 현재 라운드는 구분, 남은 라운드는 비어있음.
- **D-07:** 결과 화면(victory/gameover)은 전체 화면 전환. 게임 화면이 완전히 바뀌며 큰 메시지 + 이펙트 + 다시하기 버튼.
- **D-08:** 서스펜스 애니메이션(FX-03)은 카드 셔플 스타일. AI 카드가 빠르게 뒤집히다 감속하며 멈추고 공개. ~1.5초 동안 진행.
- **D-09:** 승리 confetti(FX-01)는 대형 폭죽. canvas-confetti로 화면 전체를 채우는 다중 폭발(중앙, 좌, 우 시차 발사). 3-4초 지속.
- **D-10:** 패배 이펙트(FX-02)는 화면 흔들림(0.3초) + 탈색(컬러->그레이스케일 0.5초) + 관 깨지는 크랙 이펙트(선택적). 약 1초간 극적 연출.
- **D-11:** 빠른 템포 -- 선택 후 서스펜스 1초 -> 공개 0.3초 -> 결과 표시 1초 -> 자동 다음 라운드. 전체 약 2.5초/라운드. "다음" 버튼 없이 자동 전환.
- **D-12:** 라운드 결과(승/패)는 큰 텍스트("승리!" / "패배...")로 표시 + 배경 색상 플래시(승=초록, 패=빨간).
- **D-13:** 무승부는 "무승부! 다시!" 텍스트(노란색) 표시 후 0.8초 뒤 자동으로 같은 라운드 선택 화면으로 전환.

### Claude's Discretion
- Zustand store 구조 및 selector 설계 -- 리서치/플래닝에서 결정
- 컴포넌트 분리 구조 (GameBoard, ChoiceButton, ResultScreen 등 명명/분리)
- SVG 손 아이콘 세부 디자인 -- 카툰 스타일 범위 내에서 자유
- motion v12 애니메이션 variants 설계 -- 위 타이밍 범위 내에서 자유
- 크랙 이펙트 구현 여부 및 방식

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FX-01 | 5판 모두 승리 시 폭죽(confetti) 이펙트가 재생된다 | canvas-confetti multi-burst fireworks pattern with `useWorker: true`, 3-4 second staggered launches from center/left/right |
| FX-02 | 패배 시 아쉬움 이펙트(흔들림 + 탈색)가 재생된다 | Tailwind `@theme` custom shake keyframes + `grayscale` utility for CSS-based desaturation; motion `useAnimate` for orchestrated sequence |
| FX-03 | AI 선택 공개 전 1~2초 긴장감 서스펜스 애니메이션이 재생된다 | motion `useAnimate` timeline sequence: rapid card shuffle with deceleration curve over ~1.5s |
| FX-04 | 선택 결과 등장 시 공개 애니메이션(0.3~0.6s)이 재생된다 | motion `AnimatePresence` with spring transition for choice reveal; `rotateY` card flip 0.3s |
| UI-01 | 모바일 우선 반응형 레이아웃 (최소 터치 타겟 44px) | Tailwind responsive utilities, `min-h-[44px] min-w-[44px]` touch targets, bottom-bar pattern with `fixed bottom-0` |
| UI-02 | 생동감 있는 게임 스타일 UI (색감, 애니메이션, 게임 느낌) | Custom SVG cartoon glove icons, round-based background color gradient (blue->red), arcade-style typography, spring animations |
| UI-03 | 3초 이내 초기 로드 | `dynamic(() => import(...), { ssr: false })` for game component, motion tree-shaking, canvas-confetti lazy load on victory only |

</phase_requirements>

## Standard Stack

### Core (already in package.json)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router framework | Already installed. `'use client'` directive for game components. |
| React | 19.2.4 | UI component model | Already installed. `useSyncExternalStore` powers Zustand v5. |
| Tailwind CSS | v4.x | Responsive styling, custom animations via `@theme` | Already installed. CSS-first config, `grayscale` utility, `@theme` block for custom keyframes. |
| TypeScript | 5.x | Type safety | Already installed. All Phase 1 types (`Choice`, `Phase`, `GameState`) ready to consume. |

### To Install
| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| motion | 12.38.0 | State-driven animations: `AnimatePresence`, `useAnimate`, gesture props | `npm install motion` |
| canvas-confetti | 1.9.4 | Victory fireworks effect (FX-01) | `npm install canvas-confetti` |
| @types/canvas-confetti | 1.9.0 | TypeScript types for canvas-confetti | `npm install -D @types/canvas-confetti` |
| Zustand | 5.0.12 | Client-side game state store | `npm install zustand` |

### Test Infrastructure (to install for UI testing)
| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| @vitejs/plugin-react | latest | Vitest React transform plugin | `npm install -D @vitejs/plugin-react` |
| @testing-library/react | 16.3.2 | React component test utilities | `npm install -D @testing-library/react` |
| @testing-library/dom | latest | DOM test utilities (peer dep) | `npm install -D @testing-library/dom` |
| @testing-library/jest-dom | 6.9.1 | DOM matchers (toBeInTheDocument, etc.) | `npm install -D @testing-library/jest-dom` |
| @testing-library/user-event | 14.6.1 | Simulated user interaction events | `npm install -D @testing-library/user-event` |
| jsdom | 29.0.1 | DOM simulation environment for Vitest | `npm install -D jsdom` |

**Combined install:**
```bash
# Runtime
npm install motion canvas-confetti zustand

# Dev / types
npm install -D @types/canvas-confetti @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| motion v12 | CSS `@keyframes` only | CSS is fine for ambient effects (pulse, glow) but cannot coordinate state-driven sequences (simultaneous choice reveal, suspense deceleration). Use both: CSS for idle, motion for FSM transitions. |
| canvas-confetti | react-confetti-explosion | CSS-only (~4KB) but less impactful fireworks. D-09 requires multi-burst canvas fireworks. |
| Zustand v5 | React useState + useContext | Acceptable for shallow trees but game state spans 5+ component levels. Zustand avoids prop drilling and provides selective re-render subscriptions critical during animations. |
| jsdom | happy-dom | happy-dom is faster (~2x) but less accurate for DOM simulation. jsdom recommended by Next.js official docs for Vitest. |

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/rps/              # Phase 1: pure game logic (EXISTING, DO NOT MODIFY)
    types.ts            # Choice, Phase, GameState, GameAction
    constants.ts        # WIN_RATE_TABLE, TOTAL_ROUNDS
    gameRules.ts        # determineOutcome()
    aiEngine.ts         # pickAiChoice()
    session.ts          # createSession(), finalizeSession()
    index.ts            # barrel export

  store/
    gameStore.ts        # Zustand store: wraps Phase 1 functions, drives FSM

  components/
    Game.tsx            # Top-level game container, dynamic import wrapper
    screens/
      IdleScreen.tsx    # D-04: start screen with rules + start button
      PlayScreen.tsx    # D-05: choice buttons + battle area + round indicator
      ResultScreen.tsx  # D-07: victory/gameover full-screen transition
    battle/
      ChoiceCard.tsx    # SVG hand icon with flip/reveal animation
      SuspenseReveal.tsx # D-08: card shuffle suspense animation
      RoundIndicator.tsx # D-06: step dots (filled/current/empty)
    effects/
      Confetti.tsx      # D-09: canvas-confetti wrapper, imperative call
      DefeatEffect.tsx  # D-10: shake + grayscale orchestration
    ui/
      ChoiceButton.tsx  # D-05: 44px+ touch target button
    svg/
      Rock.tsx          # D-01: cartoon glove SVG (inline component)
      Paper.tsx
      Scissors.tsx

  app/
    page.tsx            # Game entry: dynamic(() => import, { ssr: false })
    layout.tsx          # Metadata, viewport, fonts (UPDATE existing)
    globals.css         # Tailwind @theme: round backgrounds, shake keyframes
```

### Pattern 1: Zustand Store as Game Controller
**What:** A single Zustand store imports Phase 1 pure functions and exposes FSM-aware actions. Components subscribe to specific slices. The store is the ONLY place game logic is called.
**When to use:** Always -- this is the central architecture decision.

```typescript
// src/store/gameStore.ts
import { create } from 'zustand'
import type { Choice, Phase, GameState, SessionPayload, Outcome } from '@/lib/rps'
import { pickAiChoice, determineOutcome, createSession, finalizeSession, TOTAL_ROUNDS } from '@/lib/rps'

interface GameStore {
  // State
  phase: Phase
  round: number            // 0-indexed
  drawCount: number
  playerChoice: Choice | null
  aiChoice: Choice | null
  lastOutcome: Outcome | null
  roundResults: Array<{ outcome: Outcome; round: number }>
  session: SessionPayload

  // Actions
  start: () => void
  select: (choice: Choice) => void
  revealDone: () => void
  advance: () => void
  retry: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'idle',
  round: 0,
  drawCount: 0,
  playerChoice: null,
  aiChoice: null,
  lastOutcome: null,
  roundResults: [],
  session: createSession(),

  start: () => set({
    phase: 'selecting',
    round: 0,
    drawCount: 0,
    playerChoice: null,
    aiChoice: null,
    lastOutcome: null,
    roundResults: [],
    session: createSession(),
  }),

  select: (choice: Choice) => {
    const { round, drawCount } = get()
    const aiChoice = pickAiChoice(round, choice, drawCount)
    set({
      phase: 'revealing',
      playerChoice: choice,
      aiChoice,
    })
  },

  revealDone: () => {
    const { playerChoice, aiChoice } = get()
    if (!playerChoice || !aiChoice) return
    const outcome = determineOutcome(playerChoice, aiChoice)
    set({ phase: 'result', lastOutcome: outcome })
  },

  advance: () => {
    const { lastOutcome, round, drawCount, roundResults, session, playerChoice, aiChoice } = get()
    if (!lastOutcome || !playerChoice || !aiChoice) return

    if (lastOutcome === 'draw') {
      set({
        phase: 'selecting',
        drawCount: drawCount + 1,
        playerChoice: null,
        aiChoice: null,
        lastOutcome: null,
      })
      return
    }

    const newResults = [...roundResults, { outcome: lastOutcome, round }]

    if (lastOutcome === 'lose') {
      set({
        phase: 'gameover',
        roundResults: newResults,
        session: finalizeSession(session, new Date()),
      })
      return
    }

    // Win
    const nextRound = round + 1
    if (nextRound >= TOTAL_ROUNDS) {
      set({
        phase: 'victory',
        roundResults: newResults,
        session: finalizeSession(session, new Date()),
      })
      return
    }

    set({
      phase: 'selecting',
      round: nextRound,
      drawCount: 0,
      playerChoice: null,
      aiChoice: null,
      lastOutcome: null,
      roundResults: newResults,
    })
  },

  retry: () => set({
    phase: 'idle',
    round: 0,
    drawCount: 0,
    playerChoice: null,
    aiChoice: null,
    lastOutcome: null,
    roundResults: [],
    session: createSession(),
  }),
}))
```

### Pattern 2: AnimatePresence for FSM Screen Transitions
**What:** Use `AnimatePresence` with `mode="wait"` at the top Game component level, keyed by FSM `phase`. Each screen animates in/out as the phase changes.
**When to use:** For every FSM phase transition (idle->selecting, result->gameover, etc.)

```typescript
// src/components/Game.tsx
'use client'
import { AnimatePresence, motion } from 'motion/react'
import { useGameStore } from '@/store/gameStore'

export default function Game() {
  const phase = useGameStore((s) => s.phase)

  return (
    <AnimatePresence mode="wait">
      {phase === 'idle' && (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <IdleScreen />
        </motion.div>
      )}
      {(phase === 'selecting' || phase === 'revealing' || phase === 'result') && (
        <motion.div
          key="play"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <PlayScreen />
        </motion.div>
      )}
      {(phase === 'victory' || phase === 'gameover') && (
        <motion.div
          key="end"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <ResultScreen />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### Pattern 3: useAnimate for Suspense Card Shuffle (D-08)
**What:** Imperative animation sequence for the AI card shuffle suspense. Three cards rapidly cycle, decelerating to reveal the AI's choice over ~1.5s.
**When to use:** During the `revealing` phase, before `revealDone` fires.

```typescript
// src/components/battle/SuspenseReveal.tsx
'use client'
import { useAnimate } from 'motion/react'
import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export function SuspenseReveal() {
  const [scope, animate] = useAnimate()
  const phase = useGameStore((s) => s.phase)
  const aiChoice = useGameStore((s) => s.aiChoice)
  const revealDone = useGameStore((s) => s.revealDone)

  useEffect(() => {
    if (phase !== 'revealing') return

    const runSuspense = async () => {
      // Rapid shuffle: rotate through choices with decreasing speed
      // Phase 1: fast shuffle (0-0.6s)
      await animate(scope.current, { rotateY: [0, 360, 720] }, { duration: 0.6, ease: 'linear' })
      // Phase 2: deceleration (0.6-1.2s)
      await animate(scope.current, { rotateY: [720, 900] }, { duration: 0.6, ease: 'easeOut' })
      // Phase 3: final reveal with spring snap (1.2-1.5s)
      await animate(scope.current, { rotateY: 0, scale: [0.8, 1.1, 1] }, { duration: 0.3, ease: 'easeOut' })

      revealDone()
    }

    runSuspense()
  }, [phase])

  return <div ref={scope}>{/* AI choice card */}</div>
}
```

### Pattern 4: canvas-confetti Multi-Burst Fireworks (D-09)
**What:** Staggered confetti bursts from center/left/right for 3-4 seconds on victory.
**When to use:** When phase transitions to `'victory'`.

```typescript
// src/components/effects/Confetti.tsx
'use client'
import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useGameStore } from '@/store/gameStore'

export function VictoryConfetti() {
  const phase = useGameStore((s) => s.phase)
  const hasFired = useRef(false)

  useEffect(() => {
    if (phase !== 'victory' || hasFired.current) return
    hasFired.current = true

    const defaults = {
      particleCount: 50,
      spread: 80,
      startVelocity: 45,
      gravity: 1.2,
      ticks: 250,
      disableForReducedMotion: true,
      useWorker: true,
    }

    // Center burst
    confetti({ ...defaults, origin: { x: 0.5, y: 0.7 } })

    // Left burst (delayed 400ms)
    setTimeout(() => {
      confetti({ ...defaults, angle: 60, origin: { x: 0.1, y: 0.8 } })
    }, 400)

    // Right burst (delayed 800ms)
    setTimeout(() => {
      confetti({ ...defaults, angle: 120, origin: { x: 0.9, y: 0.8 } })
    }, 800)

    // Second wave center (delayed 1200ms)
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.5 } })
    }, 1200)

    return () => confetti.reset()
  }, [phase])

  return null // No DOM element -- canvas-confetti creates its own canvas
}
```

### Pattern 5: Defeat Effect -- Shake + Grayscale (D-10)
**What:** CSS shake animation (0.3s) + grayscale transition (0.5s) orchestrated by motion.
**When to use:** When phase transitions to `'gameover'`.

```css
/* In globals.css @theme block */
@theme {
  --animate-shake: shake 0.3s ease-out;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
}
```

```typescript
// Defeat effect component
'use client'
import { useAnimate } from 'motion/react'
import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export function DefeatEffect({ children }: { children: React.ReactNode }) {
  const [scope, animate] = useAnimate()
  const phase = useGameStore((s) => s.phase)

  useEffect(() => {
    if (phase !== 'gameover') return

    const runDefeat = async () => {
      // Shake (0.3s)
      await animate(scope.current,
        { x: [0, -4, 4, -4, 4, -2, 2, 0] },
        { duration: 0.3, ease: 'easeOut' }
      )
      // Desaturate to grayscale (0.5s)
      await animate(scope.current,
        { filter: ['grayscale(0%)', 'grayscale(100%)'] },
        { duration: 0.5, ease: 'easeIn' }
      )
    }

    runDefeat()
  }, [phase])

  return <div ref={scope}>{children}</div>
}
```

### Pattern 6: Round-Based Background Color (D-03)
**What:** CSS custom properties for round-indexed background colors. Transition between them with motion.
**When to use:** Every round change.

```css
/* In globals.css */
:root {
  --bg-round-0: #4A90D9; /* calm blue */
  --bg-round-1: #2CA5A5; /* teal */
  --bg-round-2: #E8B84A; /* warm yellow */
  --bg-round-3: #E87E3A; /* orange */
  --bg-round-4: #D94040; /* intense red */
}
```

### Pattern 7: Dynamic Import for SSR Bypass (UI-03)
**What:** `next/dynamic` with `{ ssr: false }` for the game component. Prevents hydration mismatch from client-only game state.
**When to use:** Always for the game root component.

```typescript
// src/app/page.tsx
import dynamic from 'next/dynamic'

const Game = dynamic(() => import('@/components/Game'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen">
      <Game />
    </main>
  )
}
```

### Anti-Patterns to Avoid
- **Animating with raw CSS transitions when state-driven:** CSS transitions cannot coordinate "player choice appears, THEN AI card shuffles, THEN both revealed simultaneously." Use motion for state-driven sequences.
- **Multiple Zustand stores:** One store for game, one for UI state. Splits a single FSM into two synchronized stores -- bug magnet. Use ONE store.
- **Using `framer-motion` import path:** The `framer-motion` package is a re-export shim. Always `import { ... } from 'motion/react'`.
- **Server-rendering game components:** Game state (Math.random, crypto.randomUUID) is inherently client-side. Always use `'use client'` + `dynamic(..., { ssr: false })`.
- **Prop drilling game state through 5+ levels:** Use Zustand selectors instead. Each component subscribes to exactly the state it needs.
- **Inline setTimeout for FSM transitions without cleanup:** Always return cleanup functions from useEffect. Store `setTimeout` IDs and clear on unmount/phase change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State-driven enter/exit animations | Custom CSS class toggling with setTimeout | motion `AnimatePresence` + `exit` prop | Handles React unmounting, concurrent mode, cleanup automatically |
| Confetti/fireworks particles | Canvas particle system | canvas-confetti `confetti()` | 10KB library with worker thread support, tested cross-browser, handles cleanup |
| Card shuffle deceleration curve | Manual `requestAnimationFrame` loop with easing math | motion `useAnimate` with keyframes + `ease: 'easeOut'` | Built-in easing curves, automatic cleanup, cancelable |
| Touch-friendly responsive grid | Custom media query JS listeners | Tailwind responsive classes (`md:`, `lg:`) + `min-h-[44px]` | Declarative, maintained, works with Tailwind v4 JIT |
| Game state machine | useReducer + useContext + custom dispatch | Zustand `create()` with actions | Selective subscriptions, no provider nesting, devtools, serializable |
| Grayscale filter animation | Manual CSS transition class toggling | motion `animate` with `filter` property | Orchestrated with shake sequence, cancelable, consistent API |

**Key insight:** Every "simple" animation in a game becomes complex when it must coordinate with FSM state transitions, handle interrupts (user tapping during animation), and clean up on unmount. motion + Zustand handle all three; hand-rolled solutions handle none.

## Common Pitfalls

### Pitfall 1: Animation Fires Before Store Update Propagates
**What goes wrong:** Component subscribes to `phase`, starts animation in `useEffect`, but the `playerChoice`/`aiChoice` values haven't propagated yet -- animation reads `null`.
**Why it happens:** Zustand batches state updates but React rendering is asynchronous. The `useEffect` for phase change fires before selectors for choice values re-render.
**How to avoid:** Either (a) set phase and choices in a single `set()` call (atomic update), or (b) use `subscribeWithSelector` middleware to react to specific compound state changes.
**Warning signs:** `null` choice values during reveal animation, flickering on transition.

### Pitfall 2: setTimeout Leaks on Fast Retry
**What goes wrong:** Player taps "retry" during D-11 auto-advance setTimeout. The old timer fires on the new game, corrupting state.
**Why it happens:** setTimeout IDs are not cleared when the component unmounts or state resets.
**How to avoid:** Store all timer IDs in a ref. Clear all timers in the `retry` action. Use `useEffect` cleanup functions.
**Warning signs:** Wrong round number after restart, unexpected phase transitions.

### Pitfall 3: canvas-confetti Canvas Not Cleaned Up
**What goes wrong:** After retry, old confetti canvas persists or new confetti creates a second canvas element.
**Why it happens:** canvas-confetti creates a global canvas by default. Multiple calls without reset stack canvases.
**How to avoid:** Call `confetti.reset()` in the cleanup function of the victory effect's `useEffect`. Use `useWorker: true` to offload rendering.
**Warning signs:** Multiple overlapping confetti layers, memory leak on repeated plays.

### Pitfall 4: Touch Target Too Small on High-DPI Mobiles
**What goes wrong:** Buttons are visually 44px but the actual tappable area is smaller due to padding/margin issues or transform scaling.
**Why it happens:** 44px CSS pixels != 44px physical pixels, but touch targets are measured in CSS pixels. The issue is usually padding inside the button element.
**How to avoid:** Set `min-h-[44px] min-w-[44px]` on the OUTER interactive element (the button/a tag itself), not an inner span. Test on 360px viewport in Chrome DevTools device mode.
**Warning signs:** Difficulty tapping buttons on real phones, accidental taps on wrong button.

### Pitfall 5: Hydration Mismatch with Game State
**What goes wrong:** Next.js SSR renders the idle screen, but Zustand store initializes with different values on client, causing React hydration error.
**Why it happens:** `createSession()` uses `crypto.randomUUID()` which generates different values on server vs client.
**How to avoid:** Wrap the game component with `dynamic(() => import(...), { ssr: false })`. The game never renders on the server.
**Warning signs:** Next.js hydration error overlay in dev mode, "Text content mismatch" console errors.

### Pitfall 6: motion AnimatePresence Requires Stable Keys
**What goes wrong:** AnimatePresence exit animations don't fire, elements just disappear.
**Why it happens:** Using unstable keys (array indices, or keys that change identity) causes React to remount instead of triggering exit.
**How to avoid:** Use stable string keys based on FSM phase ("idle", "play", "end"). Do not use `phase` directly if selecting/revealing/result share the same screen -- group them under one key.
**Warning signs:** No exit animation, instant appearance of new screen.

### Pitfall 7: Vitest DOM Tests Slow with motion
**What goes wrong:** Tests that render motion components are 10-50x slower than plain React tests.
**Why it happens:** motion runs real animations in jsdom, which is a single-threaded simulation.
**How to avoid:** Mock motion in tests. Create `src/__mocks__/motion/react.tsx` that exports pass-through components without animation. Focus component tests on behavior (state transitions, button clicks), not animation correctness.
**Warning signs:** Test suite taking >30 seconds, tests timing out.

## Code Examples

### Vitest Configuration for UI Components (Updated)
```typescript
// vitest.config.ts (UPDATED to support React component testing)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
    setupFiles: ['src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File
```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom'
```

### Mocking motion for Tests
```typescript
// src/__mocks__/motion/react.tsx
// Pass-through mock: renders children without animation overhead
import React from 'react'

const createMotionComponent = (tag: string) => {
  return React.forwardRef((props: any, ref: any) => {
    const { initial, animate, exit, transition, variants, whileHover, whileTap,
            whileFocus, whileDrag, whileInView, layout, layoutId, ...rest } = props
    return React.createElement(tag, { ...rest, ref })
  })
}

export const motion = new Proxy({}, {
  get: (_, tag: string) => createMotionComponent(tag)
})

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const useAnimate = () => [{ current: null }, () => Promise.resolve()]
export const MotionConfig = ({ children }: { children: React.ReactNode }) => <>{children}</>
```

### Zustand Store Test Pattern
```typescript
// src/store/__tests__/gameStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@/store/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useGameStore.setState(useGameStore.getInitialState())
  })

  it('transitions idle -> selecting on start', () => {
    useGameStore.getState().start()
    expect(useGameStore.getState().phase).toBe('selecting')
  })

  it('computes AI choice and transitions to revealing on select', () => {
    useGameStore.getState().start()
    useGameStore.getState().select('rock')
    const state = useGameStore.getState()
    expect(state.phase).toBe('revealing')
    expect(state.playerChoice).toBe('rock')
    expect(state.aiChoice).not.toBeNull()
  })
})
```

### SVG Cartoon Hand Component Pattern (D-01)
```typescript
// src/components/svg/Rock.tsx
export function RockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Rock"
    >
      {/* Cartoon glove style: thick outlines, rounded shapes */}
      <circle cx="50" cy="50" r="40" fill="#FFE4B5" stroke="#333" strokeWidth="4" strokeLinecap="round" />
      {/* Fist details - simplified cartoon */}
      <path d="M30 45 Q50 30 70 45 Q75 60 50 70 Q25 60 30 45Z" fill="#FFD89B" stroke="#333" strokeWidth="3" />
    </svg>
  )
}
```

### Choice Button with Touch Target (D-05, UI-01)
```typescript
// src/components/ui/ChoiceButton.tsx
'use client'
import { motion } from 'motion/react'
import type { Choice } from '@/lib/rps'

interface ChoiceButtonProps {
  choice: Choice
  onSelect: (choice: Choice) => void
  disabled?: boolean
  children: React.ReactNode
}

export function ChoiceButton({ choice, onSelect, disabled, children }: ChoiceButtonProps) {
  return (
    <motion.button
      onClick={() => onSelect(choice)}
      disabled={disabled}
      className="flex items-center justify-center min-h-[56px] min-w-[56px] p-3
                 rounded-2xl bg-white shadow-lg
                 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                 touch-manipulation"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {children}
    </motion.button>
  )
}
```

### Round Indicator Dots (D-06)
```typescript
// src/components/battle/RoundIndicator.tsx
'use client'
import { motion } from 'motion/react'
import { TOTAL_ROUNDS } from '@/lib/rps'

interface RoundIndicatorProps {
  currentRound: number  // 0-indexed
  completedRounds: number
}

export function RoundIndicator({ currentRound, completedRounds }: RoundIndicatorProps) {
  return (
    <div className="flex gap-2 justify-center" role="progressbar"
         aria-valuenow={completedRounds} aria-valuemax={TOTAL_ROUNDS}>
      {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
        <motion.div
          key={i}
          className={`w-3 h-3 rounded-full border-2 ${
            i < completedRounds
              ? 'bg-green-400 border-green-500'  // completed
              : i === currentRound
              ? 'border-white bg-white/50'        // current
              : 'border-white/40 bg-transparent'  // upcoming
          }`}
          animate={i === currentRound ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      ))}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package name | `motion` package, import from `motion/react` | 2024 (v11+) | Must use `motion` directly. `framer-motion` is a re-export shim. |
| `tailwind.config.js` | Tailwind v4 CSS-first `@theme` block | Jan 2025 | Custom animations defined in CSS, not JS config. No `tailwind.config.js` file. |
| Zustand v4 `create()` | Zustand v5 `create()` with `useSyncExternalStore` | Late 2024 | React 19 native. No compatibility shim needed. |
| `AnimatePresence` `exitBeforeEnter` | `AnimatePresence` `mode="wait"` | motion v6+ | `exitBeforeEnter` removed. Use `mode="wait"`. |
| Next.js `_document.tsx` viewport meta | `generateViewport` export in layout/page | Next.js 14+ | Declarative viewport config, no custom document needed. |

**Deprecated/outdated:**
- `framer-motion` import path: Use `motion/react` instead
- `exitBeforeEnter` prop: Use `mode="wait"` instead
- `tailwind.config.js` for custom animations: Use `@theme` CSS block instead
- `getServerSideProps` / `getStaticProps`: Not applicable in App Router

## Open Questions

1. **Crack effect implementation (D-10, Claude's discretion)**
   - What we know: D-10 lists "crack effect" as optional. Could be SVG overlay with animated path drawing, or CSS pseudo-element with fracture pattern background image.
   - What's unclear: Whether the visual payoff justifies the implementation effort.
   - Recommendation: Skip for initial implementation. The shake + grayscale combination is already dramatically effective. Add crack effect as a polish task if time permits. If implemented, use an SVG `<path>` with motion `pathLength` animation for a glass-crack pattern drawing in over 0.3s.

2. **Zustand store reset on `getInitialState()`**
   - What we know: Zustand v5 supports `getInitialState()` for testing, but it requires storing initial state separately.
   - What's unclear: Whether `create()` in v5 automatically provides `getInitialState()`.
   - Recommendation: Define initial state as a constant object, pass to `create()`, and export it for test resets. Verify during implementation.

3. **canvas-confetti `useWorker` on Safari iOS**
   - What we know: `useWorker: true` runs confetti in a Web Worker. Most modern browsers support this.
   - What's unclear: Safari iOS Worker behavior with dynamically created canvases.
   - Recommendation: Use `useWorker: true` as default. Test on Safari iOS during development. If issues arise, fall back to main-thread rendering (just remove the flag).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, dev server | Yes | v24.11.0 | -- |
| npm | Package management | Yes | 11.6.1 | -- |
| Next.js | Framework | Yes | 16.2.1 (installed) | -- |
| React | UI | Yes | 19.2.4 (installed) | -- |
| Tailwind CSS | Styling | Yes | v4.x (installed) | -- |
| Vitest | Testing | Yes | v4.1.2 (installed) | -- |
| motion | Animations | No (to install) | 12.38.0 (npm) | -- |
| canvas-confetti | Victory effect | No (to install) | 1.9.4 (npm) | -- |
| zustand | State management | No (to install) | 5.0.12 (npm) | -- |
| @vitejs/plugin-react | React Vitest plugin | No (to install) | latest (npm) | -- |
| jsdom | Test DOM environment | No (to install) | 29.0.1 (npm) | -- |

**Missing dependencies with no fallback:**
- motion, canvas-confetti, zustand: Must be installed before any Phase 2 work begins.

**Missing dependencies with fallback:**
- Testing libraries (@testing-library/react, jsdom, etc.): Must be installed for UI tests but not blocking for component implementation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (exists, needs update for jsdom + react plugin) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FX-01 | Victory triggers confetti effect | unit (store transition) | `npx vitest run src/components/effects/__tests__/Confetti.test.tsx -t "fires on victory"` | No -- Wave 0 |
| FX-02 | Defeat triggers shake + grayscale | unit (store transition) | `npx vitest run src/components/effects/__tests__/DefeatEffect.test.tsx -t "fires on gameover"` | No -- Wave 0 |
| FX-03 | Suspense animation plays before reveal | unit (phase transition) | `npx vitest run src/store/__tests__/gameStore.test.ts -t "selecting to revealing"` | No -- Wave 0 |
| FX-04 | Choice reveal animation (0.3-0.6s) | unit (phase transition) | `npx vitest run src/store/__tests__/gameStore.test.ts -t "revealDone"` | No -- Wave 0 |
| UI-01 | Mobile layout, 44px touch targets | unit (render) | `npx vitest run src/components/ui/__tests__/ChoiceButton.test.tsx -t "touch target"` | No -- Wave 0 |
| UI-02 | Game-style visual UI renders | unit (render) | `npx vitest run src/components/__tests__/Game.test.tsx -t "renders"` | No -- Wave 0 |
| UI-03 | Initial load under 3 seconds | manual + build analysis | `npx next build && npx next start` (check Lighthouse) | Manual only |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Update `vitest.config.ts` -- add `@vitejs/plugin-react`, change environment to `jsdom`, add setupFiles
- [ ] Create `src/__tests__/setup.ts` -- import `@testing-library/jest-dom`
- [ ] Create `src/__mocks__/motion/react.tsx` -- pass-through mock for motion components
- [ ] Create `src/store/__tests__/gameStore.test.ts` -- FSM transition tests
- [ ] Create `src/components/__tests__/Game.test.tsx` -- screen rendering tests
- [ ] Create `src/components/ui/__tests__/ChoiceButton.test.tsx` -- touch target and interaction tests
- [ ] Install test dependencies: `npm install -D @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom`

## Project Constraints (from CLAUDE.md)

- **Tech stack locked:** Next.js + React + TypeScript. App Router only (no Pages Router).
- **Mobile-first:** Minimum touch target 44px. Responsive layout.
- **Performance:** CSS-based or lightweight library animations only. No heavy game engines (Phaser, PixiJS, Three.js).
- **Embed-ready:** Must work in iframe. `X-Frame-Options` / CSP headers (Phase 3 scope, but layout must not break in iframe).
- **Imports:** `motion/react` NOT `framer-motion`. `motion` package NOT `framer-motion` package.
- **State:** Zustand v5 (^5.0.12), NOT Zustand v4 or Redux.
- **Confetti:** `canvas-confetti` with `useWorker: true`, NOT `react-confetti` or `tsParticles`.
- **SSR:** Game components must use `'use client'` + `dynamic(..., { ssr: false })`.
- **GSD Workflow:** All file changes through GSD commands.

## Sources

### Primary (HIGH confidence)
- [motion v12 React Animation API](https://motion.dev/docs/react-animation) -- `motion.div`, animate prop, variants, keyframes, transitions
- [motion v12 AnimatePresence](https://motion.dev/docs/react-animate-presence) -- mode="wait", exit animations, key-based transitions
- [motion v12 Transitions](https://motion.dev/docs/react-transitions) -- spring, tween, duration, stagger, when/delayChildren
- [motion v12 useAnimate](https://motion.dev/docs/react-use-animate) -- scoped imperative animations, sequences
- [motion v12 Gestures](https://motion.dev/docs/react-gestures) -- whileTap, whileHover, mobile touch behavior
- [motion v12 Layout Animations](https://motion.dev/docs/react-layout-animations) -- layoutId, shared element transitions
- [motion v12 MotionConfig](https://motion.dev/docs/react-motion-config) -- reducedMotion, global transition defaults
- [motion v12 Stagger](https://motion.dev/docs/stagger) -- stagger() function, from, startDelay
- [motion v12 animate() sequences](https://motion.dev/docs/animate) -- timeline syntax, `at` option, labels
- [canvas-confetti GitHub](https://github.com/catdad/canvas-confetti) -- full API, useWorker, multi-burst patterns, shapes, cleanup
- [Zustand v5 GitHub README](https://github.com/pmndrs/zustand) -- create(), selectors, TypeScript, useShallow, middleware
- [Tailwind CSS v4 Animation](https://tailwindcss.com/docs/animation) -- @theme block, --animate-* variables, @keyframes, motion-safe/reduce
- [Tailwind CSS v4 Grayscale](https://tailwindcss.com/docs/grayscale) -- grayscale utility classes, arbitrary values
- [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest) -- jsdom setup, @vitejs/plugin-react, component testing

### Secondary (MEDIUM confidence)
- [npm registry: motion 12.38.0](https://www.npmjs.com/package/motion) -- version verified via `npm view`
- [npm registry: canvas-confetti 1.9.4](https://www.npmjs.com/package/canvas-confetti) -- version verified via `npm view`
- [npm registry: zustand 5.0.12](https://www.npmjs.com/package/zustand) -- version verified via `npm view`
- [npm registry: @testing-library/react 16.3.2](https://www.npmjs.com/package/@testing-library/react) -- version verified via `npm view`

### Tertiary (LOW confidence)
- None -- all findings verified against official sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via npm registry, APIs verified via official docs
- Architecture: HIGH -- patterns derived from official motion/Zustand docs and Phase 1 codebase analysis
- Pitfalls: HIGH -- derived from official docs warnings, community issues, and motion/Zustand known patterns

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable libraries, 30-day validity)
