---
phase: 01-game-logic
plan: 02
subsystem: game-logic
tags: [typescript, vitest, game-logic, rps, tdd, ai-engine, pure-functions]

# Dependency graph
requires:
  - 01-01 (types.ts: Choice, Outcome, BEATS, LOSES_TO; constants.ts: WIN_RATE_TABLE, DRAW_BONUS_PCT, MAX_DRAW_AUTO_WIN)
provides:
  - src/lib/rps/gameRules.ts: determineOutcome pure function (all 9 RPS combinations)
  - src/lib/rps/aiEngine.ts: pickAiChoice with win-rate curve, draw bonus, auto-win guard
  - src/lib/rps/__tests__/gameRules.test.ts: 9 combination tests
  - src/lib/rps/__tests__/aiEngine.test.ts: 9 AI engine tests (thresholds, draw bonus, auto-win, off-by-one)
affects: [01-03, phase-2-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD: RED (failing test committed) → GREEN (implementation passes tests)"
    - "Mock Math.random via vi.spyOn to test probabilistic thresholds deterministically"
    - "Guard clause pattern: auto-win check before any Math.random() call"
    - "BEATS[playerChoice] for player-wins path; LOSES_TO[playerChoice] for AI-wins path"
    - "effectiveRate = Math.min(baseRate + drawCount * DRAW_BONUS_PCT, 1.0)"

key-files:
  created:
    - src/lib/rps/gameRules.ts
    - src/lib/rps/aiEngine.ts
    - src/lib/rps/__tests__/gameRules.test.ts
    - src/lib/rps/__tests__/aiEngine.test.ts
  modified: []

key-decisions:
  - "BEATS[playerChoice] is the player-wins path (AI picks what player's choice beats) — confirmed against actual types.ts"
  - "Auto-win guard is the first statement in pickAiChoice before any Math.random() call — critical for deterministic testing"
  - "effectiveRate capped at 1.0 via Math.min to prevent effective rates above 100% on high draw counts"

requirements-completed: [GAME-02, GAME-04, GAME-06, GAME-07]

# Metrics
duration: 2min
completed: 2026-03-30
---

# Phase 01 Plan 02: Game Rules + AI Engine Summary

**determineOutcome (9-combo pure lookup) and pickAiChoice (win-rate curve + draw bonus + auto-win guard) implemented with TDD; 18 new tests green, 33 total tests passing**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T13:26:18Z
- **Completed:** 2026-03-30T13:28:10Z
- **Tasks:** 2
- **Files modified:** 4 created

## Accomplishments

- `determineOutcome(playerChoice, aiChoice): Outcome` — covers all 9 RPS combinations using BEATS lookup
- `pickAiChoice(roundIndex, playerChoice, drawCount): Choice` — full win-rate curve, draw bonus, auto-win guard
- Auto-win guard verified by `vi.spyOn(Math, 'random')` — confirmed it fires BEFORE any Math.random() call
- Draw bonus: round index 1 with drawCount=1 produces effective rate 0.80 (verified: roll 0.79 → player wins, 0.81 → non-win path)
- All 33 tests in `src/lib/rps/` green; TypeScript `--noEmit` passes clean

## Task Commits

Each task was committed atomically with TDD pattern (RED in task, GREEN in same commit):

1. **Task 1: determineOutcome with full 9-combination test coverage** - `c60a8a9` (feat)
   - gameRules.test.ts (9 tests) + gameRules.ts implementation
2. **Task 2: pickAiChoice with draw bonus and auto-win logic** - `712bbc1` (feat)
   - aiEngine.test.ts (9 tests) + aiEngine.ts implementation

_Note: Both TDD tasks kept test file and implementation in single commit (tests written first, confirmed RED by running before implementation, then GREEN commit)._

## Files Created/Modified

- `src/lib/rps/gameRules.ts` — `determineOutcome(playerChoice, aiChoice): Outcome`; uses `BEATS[aiChoice] === playerChoice` for lose check; no React imports
- `src/lib/rps/aiEngine.ts` — `pickAiChoice(roundIndex, playerChoice, drawCount): Choice`; guard clause first, BEATS/LOSES_TO semantic verified against types.ts; no React imports
- `src/lib/rps/__tests__/gameRules.test.ts` — 9 tests: all 3 draws, all 3 player-wins, all 3 player-loses
- `src/lib/rps/__tests__/aiEngine.test.ts` — 9 tests: win-rate threshold, non-win split (draw/AI-wins), draw bonus at 0.80, auto-win drawCount=3 and 4 (no Math.random), off-by-one guard at round index 4

## Decisions Made

- **BEATS[playerChoice] confirmed for player-wins path**: types.ts shows `BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }`. BEATS[playerChoice] is what playerChoice beats — AI picks that choice, player's choice beats it, player wins. This matches the semantic in the plan interfaces.
- **LOSES_TO[playerChoice] confirmed for AI-wins path**: `LOSES_TO = { scissors: 'rock', rock: 'paper', paper: 'scissors' }`. The choice that beats playerChoice. AI picks it, AI wins.
- **effectiveRate = Math.min(..., 1.0)** added: prevents effective rates above 1.0 on edge-case high draw counts. Not in plan spec but necessary for correctness.
- **Subroll 50/50 split** between draw and AI-wins: When roll >= effectiveRate, a second Math.random() call splits remaining probability evenly (subRoll < 0.5 → draw, >= 0.5 → AI wins).

## BEATS and LOSES_TO Reference (critical for Plan 03)

Confirmed actual values from `src/lib/rps/types.ts`:

```
BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' }
  → BEATS[playerChoice] = what playerChoice defeats → AI picks this → player wins

LOSES_TO = { scissors: 'rock', rock: 'paper', paper: 'scissors' }
  → LOSES_TO[playerChoice] = what beats playerChoice → AI picks this → AI wins
```

When `determineOutcome(player, ai)` is called after `pickAiChoice`:
- If AI picked `BEATS[player]` → outcome = 'win'
- If AI picked `LOSES_TO[player]` → outcome = 'lose'
- If AI picked `player` → outcome = 'draw'

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — both functions are pure logic with no data source stubs. All inputs/outputs are concrete values.

## Self-Check: PASSED

- FOUND: src/lib/rps/gameRules.ts
- FOUND: src/lib/rps/aiEngine.ts
- FOUND: src/lib/rps/__tests__/gameRules.test.ts
- FOUND: src/lib/rps/__tests__/aiEngine.test.ts
- FOUND: commit c60a8a9 (Task 1 — determineOutcome)
- FOUND: commit 712bbc1 (Task 2 — pickAiChoice)
- All 33 tests passing (npx vitest run src/lib/rps/)
- TypeScript --noEmit: clean (no errors)
