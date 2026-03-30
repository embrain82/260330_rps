---
phase: 02-ui-effects
plan: 01
subsystem: ui
tags: [zustand, motion, canvas-confetti, vitest, jsdom, svg, tailwind-css, game-state]

# Dependency graph
requires:
  - phase: 01-game-logic
    provides: "Pure game functions (pickAiChoice, determineOutcome, createSession, finalizeSession), types (Choice, Phase, Outcome, SessionPayload), constants (TOTAL_ROUNDS, WIN_RATE_TABLE)"
provides:
  - "Zustand game store (useGameStore) wrapping Phase 1 pure functions as FSM controller"
  - "Test infrastructure for React component testing (jsdom, @testing-library/react, motion mock)"
  - "Game theme CSS variables (round backgrounds, result flashes, accent, keyframes)"
  - "3 SVG cartoon glove hand icons (RockIcon, PaperIcon, ScissorsIcon)"
  - "Korean locale layout with game metadata and viewport export"
affects: [02-02, 02-03, 03-integration]

# Tech tracking
tech-stack:
  added: [motion@12.38.0, canvas-confetti@1.9.4, zustand@5.0.12, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitejs/plugin-react, jsdom]
  patterns: [zustand-store-wrapping-pure-functions, atomic-set-for-concurrent-reads, tdd-red-green, vitest-jsdom-react-testing]

key-files:
  created:
    - src/store/gameStore.ts
    - src/store/__tests__/gameStore.test.ts
    - src/__tests__/setup.ts
    - src/__mocks__/motion/react.tsx
    - src/components/svg/Rock.tsx
    - src/components/svg/Paper.tsx
    - src/components/svg/Scissors.tsx
  modified:
    - package.json
    - vitest.config.ts
    - src/app/globals.css
    - src/app/layout.tsx

key-decisions:
  - "Vitest setup uses explicit expect.extend(matchers) instead of globals:true to keep jest-dom compatible with globals:false"
  - "Atomic set() in select() action prevents null reads between playerChoice and aiChoice updates"
  - "SVG components are pure presentational (no 'use client' directive) -- importable by both server and client components"
  - "Static viewport export (export const viewport: Viewport) used instead of generateViewport since no dynamic viewport needed"

patterns-established:
  - "Zustand store as FSM controller: store imports Phase 1 pure functions, components only call store actions"
  - "Atomic state updates: multi-field updates use single set() call to prevent intermediate states"
  - "Motion mock pattern: Proxy-based mock strips animation props, renders real HTML for testing"
  - "Test setup: vitest + jsdom + @testing-library/react with explicit matchers extension"

requirements-completed: [UI-01, UI-02, UI-03]

# Metrics
duration: 5min
completed: 2026-03-30
---

# Phase 02 Plan 01: Foundation Dependencies, Game Store, Theme & Icons Summary

**Zustand v5 FSM game store wrapping Phase 1 logic, jsdom test infrastructure with motion mock, arcade theme CSS with round-escalating backgrounds, and 3 cartoon glove SVG hand icons**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-30T08:57:47Z
- **Completed:** 2026-03-30T09:03:25Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Zustand v5 store implements full FSM (idle->selecting->revealing->result->gameover/victory) with 5 actions wrapping Phase 1 pure functions
- Test infrastructure upgraded: jsdom environment, React plugin, @testing-library suite, motion mock -- 53 total tests pass (43 Phase 1 + 10 store)
- Game theme CSS: 5 round background colors (blue->red), 3 result flash colors, accent, shake/pulse/glow keyframes, no dark mode
- 3 SVG cartoon glove hand icons with aria-labels for accessibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and set up test infrastructure** - `d8cbd40` (chore)
2. **Task 2: Create Zustand game store with FSM transitions** - `7bcde35` (test: RED), `56aca68` (feat: GREEN)
3. **Task 3: Update globals.css, layout.tsx, and create SVG hand icons** - `f1cef93` (feat)

## Files Created/Modified
- `src/store/gameStore.ts` - Zustand v5 FSM store with start/select/revealDone/advance/retry actions
- `src/store/__tests__/gameStore.test.ts` - 10 FSM transition tests covering all paths
- `src/__tests__/setup.ts` - Vitest setup with jest-dom matchers and React cleanup
- `src/__mocks__/motion/react.tsx` - Proxy-based motion mock for test performance
- `src/components/svg/Rock.tsx` - Cartoon glove closed fist SVG (aria-label: "바위")
- `src/components/svg/Paper.tsx` - Cartoon glove open hand SVG (aria-label: "보")
- `src/components/svg/Scissors.tsx` - Cartoon glove V-sign SVG (aria-label: "가위")
- `src/app/globals.css` - Game theme: round backgrounds, flash colors, accent, keyframes
- `src/app/layout.tsx` - Korean locale, game metadata, viewport export
- `package.json` - Added motion, canvas-confetti, zustand, test libraries
- `vitest.config.ts` - jsdom environment, React plugin, .tsx support, setupFiles

## Decisions Made
- **jest-dom with globals:false**: Used explicit `expect.extend(matchers)` in setup.ts instead of enabling Vitest globals, keeping the strict import style from Phase 1
- **Atomic set() in select()**: Sets playerChoice, aiChoice, and phase in a single Zustand set() call to prevent components from reading intermediate null states (Pitfall 1 from RESEARCH.md)
- **No 'use client' on SVGs**: SVG icon components are pure presentational JSX with no hooks -- they can be imported by client components without needing the directive themselves
- **Static viewport export**: Used `export const viewport: Viewport` instead of `generateViewport` function since viewport config is static

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed jest-dom setup for globals:false vitest config**
- **Found during:** Task 1 (test infrastructure setup)
- **Issue:** `import '@testing-library/jest-dom'` requires Vitest globals to be enabled; with `globals: false` it throws `ReferenceError: expect is not defined`
- **Fix:** Changed setup.ts to explicitly import `expect` from vitest and use `expect.extend(matchers)` pattern with `@testing-library/jest-dom/matchers`
- **Files modified:** src/__tests__/setup.ts
- **Verification:** All 43 Phase 1 tests pass, all 10 store tests pass
- **Committed in:** d8cbd40 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary for test setup compatibility. No scope creep.

## Issues Encountered
None beyond the deviation documented above.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all files contain complete implementations.

## Next Phase Readiness
- Zustand store ready for component consumption via `useGameStore` hook
- Motion library installed and mock available for testing animated components
- Canvas-confetti installed for victory effect in Plan 02-03
- CSS theme variables ready for component styling (round backgrounds, flash colors, keyframes)
- SVG icons ready for import into choice button components
- All 53 tests pass as regression baseline

---
## Self-Check: PASSED

All 9 created/modified files verified present. All 4 commit hashes verified in git log.

---
*Phase: 02-ui-effects*
*Completed: 2026-03-30*
