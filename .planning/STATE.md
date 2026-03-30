---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Bug Fixes
status: planning
stopped_at: ""
last_updated: "2026-03-31T00:00:00.000Z"
last_activity: 2026-03-31
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** "한 판 더" 도전하고 싶은 긴장감 있는 게임 경험 — 참여자가 끝까지 이기면 보상을 받는 구조.
**Current focus:** Phase 03 — embed-integration

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-31 — Milestone v1.1 started

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-game-logic P01 | 4 | 2 tasks | 7 files |
| Phase 01-game-logic P02 | 2 | 2 tasks | 4 files |
| Phase 01-game-logic P03 | 2 | 2 tasks | 3 files |
| Phase 02-ui-effects P01 | 5 | 3 tasks | 11 files |
| Phase 02-ui-effects P02 | 2 | 2 tasks | 6 files |
| Phase 02-ui-effects P03 | 16 | 3 tasks | 6 files |
| Phase 03-embed-integration P01 | 4 | 2 tasks | 6 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- (Init): Client-side probability calculation — no server round-trip, coupon issuance delegated to parent app
- (Init): CSS animations + SVG/emoji effects — no game engine, no canvas rendering
- (Init): Coupon issued via postMessage callback — game emits win event only, parent owns coupon logic
- [Phase 01-game-logic]: Next.js 16.2.1 scaffolded (RESEARCH.md authoritative over CLAUDE.md stack reference)
- [Phase 01-game-logic]: passWithNoTests: true in vitest.config.ts — Vitest 4 exits code 1 on no files without this flag
- [Phase 01-game-logic]: BEATS/LOSES_TO as Record<Choice,Choice> lookups; 0-indexed round in GameState to match WIN_RATE_TABLE directly
- [Phase 01-game-logic]: BEATS[playerChoice] confirmed for player-wins path in pickAiChoice; LOSES_TO[playerChoice] for AI-wins path
- [Phase 01-game-logic]: Auto-win guard is first statement in pickAiChoice before any Math.random() call — verified by vi.spyOn test
- [Phase 01-game-logic]: effectiveRate capped at 1.0 via Math.min to prevent rates above 100% on high draw counts
- [Phase 01-game-logic]: crypto.randomUUID() built-in used for UUID v4 — no uuid package needed
- [Phase 01-game-logic]: completedAt initialized as empty string not null — consistent with D-08 string type contract for Phase 3
- [Phase 01-game-logic]: Barrel export index.ts created as Phase 2 integration surface — @/lib/rps single import point
- [Phase 02-ui-effects]: jest-dom with globals:false uses explicit expect.extend(matchers) pattern
- [Phase 02-ui-effects]: Zustand store uses atomic set() in select() to prevent null reads between playerChoice/aiChoice updates
- [Phase 02-ui-effects]: SVG icon components are pure presentational (no use client) -- importable by any component
- [Phase 02-ui-effects]: Static viewport export used instead of generateViewport since viewport config is static
- [Phase 02-ui-effects]: ChoiceCard uses backfaceVisibility hidden for true 3D flip (no layout shift during animation)
- [Phase 02-ui-effects]: ResultFlash is private sub-component inside PlayScreen (tightly coupled to game outcome display)
- [Phase 02-ui-effects]: Player/AI labels rendered inside ChoiceCard component for self-contained battle card units
- [Phase 02-ui-effects]: SuspenseReveal receives aiChoice as prop for reusability, reads only revealDone from store
- [Phase 02-ui-effects]: Victory and gameover use separate AnimatePresence keys to ensure effects retrigger after retry cycles
- [Phase 02-ui-effects]: Auto-advance delay: 800ms draw, 1000ms win/lose, matching D-11/D-12/D-13 timing contract
- [Phase 03-embed-integration]: usePostMessage hook pattern (not store middleware) for postMessage with useEffect lifecycle cleanup
- [Phase 03-embed-integration]: contain:content (not strict) for CSS containment -- avoids height collapse with min-h-screen
- [Phase 03-embed-integration]: couponConfig preserved in both retry() and start() via get().couponConfig pattern for iframe session persistence

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3: If embedding in a specific platform (Toss, KakaoTalk webview), verify postMessage behavior against that platform's documented constraints before Phase 3 begins
- Phase 3: Backend coupon API contract (endpoint, session validation, idempotency key) must be agreed with parent app team before Phase 3 integration

## Session Continuity

Last session: 2026-03-30T11:10:10.015Z
Stopped at: Completed 03-01-PLAN.md
Resume file: None
