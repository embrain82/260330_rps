---
phase: 01-game-logic
plan: 01
subsystem: testing
tags: [nextjs, typescript, vitest, game-logic, types, constants, rps]

# Dependency graph
requires: []
provides:
  - Next.js 16.2.1 scaffold with TypeScript, Tailwind v4, App Router, Turbopack
  - Vitest 4.1.2 test infrastructure with vitest.config.ts
  - src/lib/rps/types.ts: Choice, Outcome, Phase, GameState, GameAction, RoundRecord, SessionPayload, BEATS, LOSES_TO
  - src/lib/rps/constants.ts: WIN_RATE_TABLE, DRAW_BONUS_PCT, MAX_DRAW_AUTO_WIN, TOTAL_ROUNDS
  - 15 passing unit tests verifying type shape and constant values
affects: [01-02, 01-03, phase-2-ui, phase-3-integration]

# Tech tracking
tech-stack:
  added:
    - next@16.2.1
    - react@19.2.4
    - typescript@^5
    - tailwindcss@^4
    - vitest@4.1.2
    - "@vitest/coverage-v8@4.1.2"
  patterns:
    - "Pure TypeScript game logic layer in src/lib/rps/ — no React imports"
    - "TDD: test file committed before implementation (RED → GREEN)"
    - "const assertions on WIN_RATE_TABLE for immutable tuple typing"
    - "Record<Choice, Choice> for lookup tables (type-safe, O(1))"

key-files:
  created:
    - src/lib/rps/types.ts
    - src/lib/rps/constants.ts
    - src/lib/rps/__tests__/types.test.ts
    - vitest.config.ts
    - package.json
    - tsconfig.json
    - next.config.ts
  modified: []

key-decisions:
  - "Next.js 16.2.1 scaffolded (RESEARCH.md authoritative over CLAUDE.md's prior stack reference)"
  - "passWithNoTests: true added to vitest.config.ts — Vitest 4 exits code 1 on no files without this flag"
  - "BEATS/LOSES_TO as const lookups over switch statements — type-safe, O(1), exhaustive"
  - "crypto.randomUUID() for session UUIDs — zero-dependency, built into Node 14.17+ and all modern browsers"
  - "round field is 0-indexed in GameState to match WIN_RATE_TABLE index directly (avoids off-by-one pitfall)"

patterns-established:
  - "Pattern: src/lib/rps/ is a pure TypeScript layer — no React or DOM imports allowed in this directory"
  - "Pattern: BEATS[X] = what X beats; LOSES_TO[X] = what X loses to (the choice that beats X)"
  - "Pattern: WIN_RATE_TABLE index 0 = round 1 to ensure correct 30% rate for round 5 at index 4"

requirements-completed: [GAME-01, GAME-03, GAME-05]

# Metrics
duration: 4min
completed: 2026-03-30
---

# Phase 01 Plan 01: Scaffold + Type Contract Summary

**Next.js 16.2.1 scaffold with Vitest 4.1.2 test infra; complete RPS type contract (Choice, Outcome, Phase, GameState, GameAction, BEATS/LOSES_TO lookups, WIN_RATE_TABLE [0.85→0.30], all 15 tests green)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T04:18:29Z
- **Completed:** 2026-03-30T04:22:53Z
- **Tasks:** 2
- **Files modified:** 7 created

## Accomplishments
- Next.js 16.2.1 project scaffolded with TypeScript, Tailwind v4, App Router, Turbopack dev server
- Vitest 4.1.2 installed with `vitest.config.ts` at root; `npm test` and `npm run test:watch` scripts added
- Complete game type contract in `src/lib/rps/types.ts` and `src/lib/rps/constants.ts` — all 9 exports, all 4 constants, all 15 tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js project and install Vitest** - `690f0ea` (chore)
2. **Task 2: RED — Failing tests for types and constants** - `c815cff` (test)
3. **Task 2: GREEN — Implement types.ts and constants.ts** - `a251f23` (feat)

_Note: Task 2 was TDD, producing two commits: test (RED) then implementation (GREEN)._

## Files Created/Modified

- `src/lib/rps/types.ts` — Choice, Outcome, Phase, BEATS, LOSES_TO, RoundRecord, SessionPayload, GameState, GameAction
- `src/lib/rps/constants.ts` — WIN_RATE_TABLE, DRAW_BONUS_PCT, MAX_DRAW_AUTO_WIN, TOTAL_ROUNDS
- `src/lib/rps/__tests__/types.test.ts` — 15 tests: BEATS/LOSES_TO lookup correctness, WIN_RATE_TABLE 5-entry curve, draw constants
- `vitest.config.ts` — Vitest 4 config with node environment, test glob, @/ alias, passWithNoTests
- `package.json` — Next.js 16.2.1, Vitest 4.1.2, test scripts
- `tsconfig.json` — TypeScript 5 config (scaffolded)
- `next.config.ts` — Next.js config (scaffolded)

## Decisions Made

- **Next.js 16.2.1 used** (not 15.2.4 from CLAUDE.md stack section): RESEARCH.md is the authoritative source per the plan's explicit note. `create-next-app@latest` installed 16.2.1 as expected.
- **passWithNoTests: true** added to `vitest.config.ts`: Vitest 4 changed behavior — it exits code 1 on no test files by default. Adding this flag restores exit-0 behavior when the test directory is empty (as it is during scaffold).
- **BEATS/LOSES_TO lookup tables** as `Record<Choice, Choice>`: O(1), exhaustive, type-safe. No switch statements needed.
- **crypto.randomUUID()** documented in types.ts SessionPayload: zero-dependency UUID v4. No `uuid` package installed.
- **0-indexed round** in GameState: directly maps to WIN_RATE_TABLE index. Prevents off-by-one pitfall (Pitfall 3 in RESEARCH.md).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app refused to scaffold in non-empty directory**
- **Found during:** Task 1 (scaffold Next.js project)
- **Issue:** `create-next-app . --yes` exits with "The directory contains files that could conflict" when `.planning/` and `CLAUDE.md` exist. The `--yes` flag does not bypass this check.
- **Fix:** Scaffolded into `/tmp/rps-scaffold` then `rsync`'d all generated files to the project root, excluding `.git`, `CLAUDE.md`, and `node_modules`. Then ran `npm install` in the project directory.
- **Files modified:** All scaffold files (package.json, tsconfig.json, next.config.ts, etc.)
- **Verification:** `npx vitest run` exits 0; Next.js 16.2.1 confirmed in package.json
- **Committed in:** 690f0ea (Task 1 commit)

**2. [Rule 1 - Bug] vitest.config.ts required passWithNoTests flag**
- **Found during:** Task 1 verification
- **Issue:** Vitest 4.1.2 exits code 1 when no test files are found. The plan specified "exits 0 with no test files found" but the plan's exact `vitest.config.ts` code did not include this flag.
- **Fix:** Added `passWithNoTests: true` to the `test` config object.
- **Files modified:** vitest.config.ts
- **Verification:** `npx vitest run` exits 0 (confirmed by tail output showing "exiting with code 0")
- **Committed in:** 690f0ea (Task 1 commit, vitest.config.ts included)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes were necessary to unblock task completion. No scope creep.

## Issues Encountered

- `create-next-app` conflict with pre-existing planning files — resolved by scaffolding to temp directory and rsyncing (see deviation #1 above)

## Known Stubs

None — this plan defines pure type definitions and constants with no runtime data flow. All values are concrete.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Plan 01-02 (gameRules.ts, aiEngine.ts, session.ts) can begin immediately:
- `src/lib/rps/types.ts` exports all types needed by plans 02 and 03
- `src/lib/rps/constants.ts` exports all constants needed by the AI engine
- `src/lib/rps/__tests__/` directory exists and Vitest is configured
- All 15 existing tests remain green as the foundation

No blockers.

---
*Phase: 01-game-logic*
*Completed: 2026-03-30*

## Self-Check: PASSED

- FOUND: src/lib/rps/types.ts
- FOUND: src/lib/rps/constants.ts
- FOUND: src/lib/rps/__tests__/types.test.ts
- FOUND: vitest.config.ts
- FOUND: .planning/phases/01-game-logic/01-01-SUMMARY.md
- FOUND: commit 690f0ea (scaffold + Vitest)
- FOUND: commit c815cff (RED test)
- FOUND: commit a251f23 (GREEN implementation)
