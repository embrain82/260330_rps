---
phase: 03-embed-integration
plan: 01
subsystem: integration
tags: [postMessage, iframe, zustand, react-hooks, css-containment]

# Dependency graph
requires:
  - phase: 01-game-logic
    provides: SessionPayload type, finalizeSession(), Zustand game store with session field
  - phase: 02-ui-effects
    provides: Game.tsx component with AnimatePresence screen routing
provides:
  - CouponConfig, RpsCouponConfigMessage, RpsGameWinMessage types
  - Zustand store extended with couponConfig state and setCouponConfig action
  - usePostMessage hook for bidirectional iframe communication
  - CSS containment on game root element
affects: [03-embed-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [postMessage bidirectional hook, couponConfig persistence across retry/start, CSS contain:content for iframe isolation]

key-files:
  created:
    - src/hooks/usePostMessage.ts
    - src/hooks/__tests__/usePostMessage.test.ts
  modified:
    - src/lib/rps/types.ts
    - src/store/gameStore.ts
    - src/store/__tests__/gameStore.test.ts
    - src/components/Game.tsx

key-decisions:
  - "usePostMessage as dedicated hook (not store middleware) for proper useEffect lifecycle cleanup"
  - "contain:content (not contain:strict) to avoid height collapse with min-h-screen"
  - "hasSentRef deduplication pattern prevents duplicate RPS_GAME_WIN messages on re-renders"
  - "couponConfig preserved in both retry() and start() to persist across iframe session"

patterns-established:
  - "Bidirectional postMessage hook: separate useEffects for send (phase-driven) and receive (event listener)"
  - "Origin validation via NEXT_PUBLIC_ALLOWED_ORIGIN env var with * default"
  - "Zustand state persistence: explicit get().field in set() calls for fields that survive reset"

requirements-completed: [INTG-02, INTG-03]

# Metrics
duration: 4min
completed: 2026-03-30
---

# Phase 3 Plan 1: postMessage Contract & Zustand Coupon State Summary

**Bidirectional postMessage hook with RPS_GAME_WIN send (deduped) and RPS_COUPON_CONFIG receive, Zustand couponConfig persistence across retry/start, CSS containment on game root**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T11:04:39Z
- **Completed:** 2026-03-30T11:08:46Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- CouponConfig, RpsCouponConfigMessage, and RpsGameWinMessage types added to types.ts
- Zustand store extended with couponConfig state that persists across retry() and start() calls
- usePostMessage hook sends RPS_GAME_WIN exactly once on victory (with session finalization guard) and receives RPS_COUPON_CONFIG with origin validation
- Game.tsx wired with hook and CSS containment [contain:content] on root div
- 22 new tests added (4 store + 8 hook), all 65 tests pass, TypeScript compiles clean

## Task Commits

Each task was committed atomically (TDD: test then feat):

1. **Task 1: Add postMessage types, extend Zustand store with couponConfig**
   - `e8fdfa6` test(03-01): add failing tests for couponConfig persistence
   - `24f8080` feat(03-01): add postMessage types and extend Zustand store with couponConfig

2. **Task 2: Create usePostMessage hook, wire Game.tsx with CSS containment**
   - `61909ba` test(03-01): add failing tests for usePostMessage hook
   - `cb75107` feat(03-01): implement usePostMessage hook and wire Game.tsx with CSS containment

## Files Created/Modified
- `src/lib/rps/types.ts` - Added CouponConfig, RpsCouponConfigMessage, RpsGameWinMessage interfaces
- `src/store/gameStore.ts` - Extended GameStore with couponConfig state, setCouponConfig action, preservation in retry/start
- `src/store/__tests__/gameStore.test.ts` - 4 new tests for couponConfig persistence
- `src/hooks/usePostMessage.ts` - Bidirectional postMessage hook (send RPS_GAME_WIN, receive RPS_COUPON_CONFIG)
- `src/hooks/__tests__/usePostMessage.test.ts` - 8 tests covering send/receive/dedup/origin/cleanup
- `src/components/Game.tsx` - Wired usePostMessage hook, added CSS containment [contain:content]

## Decisions Made
- Used dedicated hook (usePostMessage) instead of Zustand middleware for postMessage -- hooks provide proper useEffect lifecycle for event listener cleanup
- Used `contain:content` instead of `contain:strict` -- strict includes size containment which can collapse elements using min-h-screen
- hasSentRef pattern for deduplication -- resets to false when phase leaves victory, preventing stale ref issues on retry
- couponConfig explicitly preserved in both retry() and start() via `couponConfig: get().couponConfig` pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- postMessage contract fully implemented and tested -- Plan 02 can build coupon UI, iframe headers, and test-embed.html
- couponConfig available in store for ResultScreen to conditionally render coupon display
- usePostMessage hook already wired into Game.tsx -- no additional integration needed for Plan 02

## Self-Check: PASSED

All 7 files verified present. All 4 commits verified in git log.

---
*Phase: 03-embed-integration*
*Completed: 2026-03-30*
