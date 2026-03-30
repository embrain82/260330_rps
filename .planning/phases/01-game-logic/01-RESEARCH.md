# Phase 1: Game Logic - Research

**Researched:** 2026-03-30
**Domain:** TypeScript pure-function game logic — RPS AI engine, FSM state transitions, session UUID, win-rate probability
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 무승부 시 같은 라운드를 반복한다 (라운드 카운터 증가 없음)
- **D-02:** 무승부마다 해당 라운드의 승률이 +5% 상승한다 (예: 2판 75% → 무승부 → 80% → 무승부 → 85%)
- **D-03:** 3회 연속 무승부 시 해당 라운드 자동 승리 처리한다
- **D-04:** "85% 승률" = AI가 85% 확률로 사용자에게 지는 선택을 한다. 나머지 15%는 완전 랜덤 (승리 또는 무승부)
- **D-05:** 승률 커브: 1판 85%, 2판 75%, 3판 65%, 4판 55%, 5판 30%
- **D-06:** Math.random() 사용, 시드 고정 없음. 매 게임 완전 랜덤
- **D-07:** 승률은 사용자가 "이길" 확률이 아니라 AI가 "질" 확률이다
- **D-08:** postMessage 승리 이벤트 데이터: sessionId (UUID v4), rounds (배열), startedAt, completedAt, totalPlayTimeMs
- **D-09:** postMessage origin 검증은 환경변수로 설정. 기본값 '*'
- **D-10:** FSM 상태: `idle` → `selecting` → `revealing` → `result` → (`gameover` | `victory`)
- **D-11:** `idle` 상태에서 시작 화면 표시 — "5판 연속 승리하면 쿠폰!" 규칙 설명 + 시작 버튼
- **D-12:** `result` 상태에서 승리 시 다음 라운드의 `selecting`으로, 패배 시 `gameover`로, 5판 승리 시 `victory`로 전이
- 승률 테이블은 상수로 정의하여 쉽게 수정 가능하게
- 무승부 보너스(+5%)도 설정 가능한 상수로
- 3회 연속 무승부 자동 승리도 설정 가능한 상수로

### Claude's Discretion

- FSM 구현 방식 (useReducer vs Zustand vs 순수 함수) — 리서치/플래닝에서 결정
- 타입 정의 구조 (단일 파일 vs 분리)
- 테스트 전략 (유닛 테스트 범위)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GAME-01 | 참여자가 가위/바위/보 중 하나를 탭하여 선택할 수 있다 | `Choice` type + `gameRules.determineOutcome()` pure function |
| GAME-02 | AI가 판수별 승률에 따라 가위/바위/보를 선택한다 (1판 85%, 2판 75%, 3판 65%, 4판 55%, 5판 30%) | `WIN_RATE_TABLE` constant + `aiEngine.pickAiChoice()` pure function + draw bonus logic |
| GAME-03 | 참여자와 AI의 선택을 이미지로 동시에 공개한다 | `revealing` FSM phase holds both choices before display |
| GAME-04 | 승/패/무승부 결과를 명확하게 표시한다 | `Outcome` type (`win`/`lose`/`draw`) returned by `determineOutcome()` |
| GAME-05 | 현재 라운드 번호와 전체 진행 상황을 표시한다 | `round` field (0-indexed) in `GameState`; `rounds[]` array for history |
| GAME-06 | 이기면 다음 판으로 진행하고, 지면 즉시 게임오버 된다 | FSM transitions: win → `selecting` (or `victory`); lose → `gameover` |
| GAME-07 | 무승부 시 같은 라운드를 다시 진행한다 | FSM: draw stays at same round; `drawCount` increments; `winRate` += DRAW_BONUS_PCT |
| GAME-08 | 게임오버/승리 화면에서 다시 하기 버튼으로 재시작할 수 있다 | FSM `RETRY` action: `gameover`/`victory` → `idle`; full state reset |
</phase_requirements>

---

## Summary

Phase 1 encodes all game rules as pure TypeScript functions with no React or DOM dependencies. The core deliverables are: an AI engine that maps round index + player choice to a weighted-random AI choice, a rules function that determines win/lose/draw, a FSM reducer that enforces legal phase transitions, and session UUID generation.

The FSM implementation decision (Claude's Discretion) should use **`useReducer` in `RPSGame.tsx`** rather than Zustand for this phase. The game logic layer (`lib/rps/`) is pure functions with no state management library dependency at all — the reducer is only needed when wiring into React in a later step. For this phase, the pure functions are the primary deliverable; they can be tested entirely without a React environment.

Draw bonus logic (D-02, D-03) adds a stateful dimension to `pickAiChoice`: the effective win rate for a given round is `BASE_WIN_RATE[round] + (drawCount * DRAW_BONUS_PCT)`, capped implicitly by the auto-win rule at 3 consecutive draws. This means `pickAiChoice` must receive `drawCount` as a parameter, not just `roundIndex`.

**Primary recommendation:** Implement `lib/rps/` as five files (types, constants, gameRules, aiEngine, session), test each with Vitest unit tests, and keep all logic free of React imports.

---

## Project Constraints (from CLAUDE.md)

These directives from `CLAUDE.md` are mandatory — the planner must verify all tasks comply:

| Directive | Impact on Phase 1 |
|-----------|------------------|
| Tech: Next.js + React + TypeScript | All code in TypeScript. Scaffold with `create-next-app@latest`. |
| Platform: 모바일 우선, 최소 터치 타겟 44px | Phase 1 is logic-only (no UI), but types must support display requirements. |
| Performance: 경량 라이브러리만 — 무거운 게임 엔진 금지 | No heavy dependencies. Pure TS functions. No state machine library (XState overkill). |
| Embed: iframe 또는 컴포넌트로 임베드 가능 | Session payload shape (D-08) must be defined now for Phase 3 integration. |
| GSD Workflow: Use `/gsd:execute-phase` for all repo edits | Implementation agent must work through GSD, not direct edits. |

---

## Standard Stack

### Core (Phase 1 scope)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.7+ (bundled with Next.js 16) | Type-safe game logic | Project constraint; Next.js 16.2.1 ships TS 5.7 |
| Next.js | 16.2.1 (current stable) | App framework scaffold | Project constraint. `create-next-app@latest` now installs 16.2.1 |
| React | 19.2.4 | (scaffolded; not used by lib layer) | Peer dep of Next.js 16 |

> **Version note:** Prior stack research documented Next.js 15.2.4. As of 2026-03-20, Next.js 16.2.1 is the current stable (released 2025-10-22, latest patch 2026-03-20). `create-next-app@latest` installs 16.2.1. Use this version. Next.js 16 retains App Router, React 19.2.4 compatibility, and `'use client'` semantics unchanged.

### Supporting (Phase 1 scope)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 4.1.2 | Unit testing pure functions | Use for all `lib/rps/` tests. No DOM required for logic tests. |
| @vitest/coverage-v8 | 4.1.2 | Coverage reporting | Optional for this phase; useful for verifying probability logic paths |
| uuid package | NOT NEEDED | UUID v4 generation | Use `crypto.randomUUID()` built into browser/Node — no package needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useReducer` FSM | XState v5 | XState provides formal machine definitions and devtools, but is 40KB+ gzip overhead. `useReducer` covers the 6-state machine cleanly with zero dependency. |
| `useReducer` FSM | Zustand + slices | Zustand is the project's chosen state manager, but for a self-contained FSM that lives in one component, `useReducer` keeps the state machine co-located and easier to serialize for testing. |
| `crypto.randomUUID()` | `uuid` npm package | `crypto.randomUUID()` is available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+) and Node.js 14.17+. Zero dependency overhead. |

**Installation:**
```bash
# Scaffold (if not already done)
npx create-next-app@latest . --typescript --tailwind --app --turbopack

# Test framework
npm install -D vitest @vitest/coverage-v8
```

**Version verification (confirmed 2026-03-30):**
- `next`: 16.2.1 (npm view next version)
- `vitest`: 4.1.2 (npm view vitest version)
- `motion`: 12.38.0 (npm view motion version)
- `zustand`: 5.0.12 (npm view zustand version)
- `canvas-confetti`: 1.9.4 (npm view canvas-confetti version)

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 creates)

```
src/
└── lib/
    └── rps/
        ├── types.ts          # Choice, Outcome, Phase, GameState, RoundRecord, SessionPayload
        ├── constants.ts      # WIN_RATE_TABLE, DRAW_BONUS_PCT, MAX_DRAW_AUTO_WIN, TOTAL_ROUNDS
        ├── gameRules.ts      # determineOutcome(playerChoice, aiChoice) → Outcome
        ├── aiEngine.ts       # pickAiChoice(roundIndex, playerChoice, drawCount) → Choice
        └── session.ts        # createSession() → SessionPayload skeleton; finalizeSession()
```

Phase 1 does NOT create `RPSGame.tsx` or any component. The reducer logic lives in `RPSGame.tsx` (Phase 2). Phase 1 is the pure function layer only.

### Pattern 1: Win Rate with Draw Bonus

**What:** The effective win rate for a round is not just the base table value — it increases by `DRAW_BONUS_PCT` (5%) for each consecutive draw in the current round, capped by the auto-win rule at `MAX_DRAW_AUTO_WIN` (3 draws).

**When to use:** Always call `pickAiChoice` with the current `drawCount` for the active round.

**Example:**
```typescript
// lib/rps/constants.ts
export const WIN_RATE_TABLE = [0.85, 0.75, 0.65, 0.55, 0.30] as const
export const DRAW_BONUS_PCT = 0.05
export const MAX_DRAW_AUTO_WIN = 3
export const TOTAL_ROUNDS = 5

// lib/rps/aiEngine.ts
import { WIN_RATE_TABLE, DRAW_BONUS_PCT, MAX_DRAW_AUTO_WIN } from './constants'
import { Choice, BEATS, LOSES_TO } from './types'

export function pickAiChoice(
  roundIndex: number,    // 0-based (round 1 = index 0)
  playerChoice: Choice,
  drawCount: number      // consecutive draws this round (0 initially)
): Choice {
  // Auto-win rule: 3 consecutive draws → player wins this round
  if (drawCount >= MAX_DRAW_AUTO_WIN) {
    return LOSES_TO[playerChoice]   // AI picks the choice player beats
  }

  const baseRate  = WIN_RATE_TABLE[roundIndex] ?? 0.50
  const winRate   = Math.min(baseRate + drawCount * DRAW_BONUS_PCT, 1.0)
  const roll      = Math.random()

  if (roll < winRate) {
    return LOSES_TO[playerChoice]   // AI loses → player wins
  } else {
    // Remaining probability: split between AI wins and draw
    // The split within the losing 15% is 50/50 (intentional — D-04)
    const subRoll = Math.random()
    if (subRoll < 0.5) {
      return playerChoice             // draw
    } else {
      return BEATS[playerChoice]      // AI wins → player loses
    }
  }
}
```

### Pattern 2: Game Rules as Pure Lookup

**What:** Outcome determination is a pure mapping from two choices to a result. No randomness here.

**Example:**
```typescript
// lib/rps/types.ts
export type Choice = 'scissors' | 'rock' | 'paper'
export type Outcome = 'win' | 'lose' | 'draw'

export const BEATS: Record<Choice, Choice> = {
  scissors: 'rock',   // rock beats scissors
  rock: 'paper',      // paper beats rock
  paper: 'scissors',  // scissors beats paper
}

export const LOSES_TO: Record<Choice, Choice> = {
  scissors: 'paper',  // paper loses to scissors
  rock: 'scissors',   // scissors loses to rock
  paper: 'rock',      // rock loses to paper
}

// lib/rps/gameRules.ts
import { Choice, Outcome, BEATS } from './types'

export function determineOutcome(playerChoice: Choice, aiChoice: Choice): Outcome {
  if (playerChoice === aiChoice) return 'draw'
  if (BEATS[aiChoice] === playerChoice) return 'lose'  // AI's choice beats player
  return 'win'
}
```

### Pattern 3: Session UUID via crypto.randomUUID()

**What:** Use the Web Crypto API built-in rather than a package. The `sessionId` is generated at game start and persists through the full session. The full payload shape is defined now for Phase 3 postMessage integration.

**Example:**
```typescript
// lib/rps/types.ts
export interface RoundRecord {
  roundNumber: number    // 1-based for display
  playerChoice: Choice
  aiChoice: Choice
  outcome: Outcome
  drawCount: number      // consecutive draws before this round resolved
}

export interface SessionPayload {
  sessionId: string      // UUID v4 via crypto.randomUUID()
  rounds: RoundRecord[]
  startedAt: string      // ISO 8601
  completedAt: string    // ISO 8601 (null until game ends)
  totalPlayTimeMs: number
}

// lib/rps/session.ts
export function createSession(): SessionPayload {
  return {
    sessionId: crypto.randomUUID(),
    rounds: [],
    startedAt: new Date().toISOString(),
    completedAt: '',
    totalPlayTimeMs: 0,
  }
}

export function finalizeSession(
  session: SessionPayload,
  endTime: Date
): SessionPayload {
  return {
    ...session,
    completedAt: endTime.toISOString(),
    totalPlayTimeMs: endTime.getTime() - new Date(session.startedAt).getTime(),
  }
}
```

### Pattern 4: FSM Type Definitions (for Phase 2 reducer)

Phase 1 defines the types that Phase 2 will consume. The FSM itself lives in the React component, but the state shape and action types belong in the `lib/rps/types.ts` file.

```typescript
// lib/rps/types.ts (continued)
export type Phase =
  | 'idle'
  | 'selecting'
  | 'revealing'
  | 'result'
  | 'gameover'
  | 'victory'

export interface GameState {
  phase:        Phase
  session:      SessionPayload
  round:        number          // 0-indexed (0 = round 1)
  drawCount:    number          // consecutive draws in current round
  playerChoice: Choice | null
  aiChoice:     Choice | null
  lastOutcome:  Outcome | null
}

export type GameAction =
  | { type: 'START' }
  | { type: 'SELECT'; choice: Choice }
  | { type: 'REVEAL_DONE' }
  | { type: 'ADVANCE' }         // called after result is shown
  | { type: 'RETRY' }
```

### Anti-Patterns to Avoid

- **Passing `roundIndex` without `drawCount` to `pickAiChoice`:** The draw bonus is part of D-02 and is a locked decision. Any implementation that ignores `drawCount` will fail requirement GAME-07 validation.
- **Putting game logic inside the reducer:** The reducer should call `pickAiChoice()` and `determineOutcome()` as pure function calls — it should not contain probability math inline.
- **Using the `uuid` npm package:** `crypto.randomUUID()` is built-in and produces RFC 4122 v4 UUIDs. Adding `uuid@13` as a dependency is unnecessary bloat for this use case.
- **Storing `drawCount` only in the round record:** `drawCount` must be in live `GameState` so `pickAiChoice` can read it during the current round. Once the round resolves, it gets written to the `RoundRecord` and reset to 0 in state.
- **Blocking the auto-win path in the AI engine:** When `drawCount >= MAX_DRAW_AUTO_WIN`, the function must return `LOSES_TO[playerChoice]` without rolling `Math.random()`. Rolling first and then overriding would make the path non-deterministic in tests.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID v4 generation | Custom UUID implementation | `crypto.randomUUID()` | Built into Web Crypto API; RFC 9562 compliant; zero dependencies |
| Probability weighting | Manual if/else chains | Single `Math.random()` roll against threshold | Simpler, fewer branches, easier to test |
| Choice relationship maps | Switch statements | `BEATS` / `LOSES_TO` lookup objects | O(1), exhaustive, readable, type-safe with `Record<Choice, Choice>` |
| FSM enforcement | Nested boolean flags | Phase enum + transition table | Structural prevention of impossible states |

**Key insight:** The game logic for RPS is genuinely simple — the complexity budget should be spent on the draw bonus state management and clear type definitions, not on clever algorithms.

---

## Common Pitfalls

### Pitfall 1: Draw Bonus Applied to Wrong Round

**What goes wrong:** `drawCount` is tracked per-session rather than per-round. When a new round begins after a win, the draw counter is not reset to 0, and the new round starts with an artificially elevated win rate.

**Why it happens:** State management oversight. The reducer's `ADVANCE` action forgets to zero `drawCount` when transitioning `result → selecting`.

**How to avoid:** Explicitly reset `drawCount: 0` in the `ADVANCE` action handler whenever the round number increments.

**Warning signs:** Round 2 starts at 80% instead of 75% after a draw in round 1.

---

### Pitfall 2: Auto-Win Check After Random Roll

**What goes wrong:** `pickAiChoice` rolls `Math.random()` first, then checks `drawCount >= MAX_DRAW_AUTO_WIN` and overrides. The function returns a forced win but has already consumed a random number, making tests flaky when mocking `Math.random`.

**Why it happens:** Guard clause placed at the wrong position.

**How to avoid:** Check `drawCount >= MAX_DRAW_AUTO_WIN` as the first line in `pickAiChoice`, before any random call.

**Warning signs:** Tests that mock `Math.random` to return a specific value pass inconsistently when testing the auto-win path.

---

### Pitfall 3: Off-by-One in Round Index

**What goes wrong:** `WIN_RATE_TABLE[round]` where `round` is 1-indexed (1–5) instead of 0-indexed (0–4). Round 5 maps to `WIN_RATE_TABLE[5]` which is `undefined`, falling back to 0.50 instead of 0.30.

**Why it happens:** Round numbers are displayed as 1–5 to users, so developers store `round` as 1-indexed in state.

**How to avoid:** Keep `round` in `GameState` as 0-indexed. Display as `round + 1` in the UI. Comment the constant: `// index 0 = round 1`.

**Warning signs:** Final round feels noticeably easier than expected; console shows `WIN_RATE_TABLE[5] = undefined`.

---

### Pitfall 4: Victory Condition Wrong

**What goes wrong:** Victory check uses `round === 5` after incrementing, but since round is 0-indexed, the 5th round is `round === 4`. Checking `round === 5` means victory never triggers; the game tries to start round 6.

**Why it happens:** Confusion between "rounds played" count and the 0-indexed round field.

**How to avoid:** Define a constant `TOTAL_ROUNDS = 5` and check victory as `round + 1 >= TOTAL_ROUNDS` (or equivalently `round >= TOTAL_ROUNDS - 1`) after a win.

**Warning signs:** After winning round 5, game transitions to `selecting` with no choice buttons (round 5 is the last valid index).

---

### Pitfall 5: SessionPayload Shape Mismatch with Phase 3

**What goes wrong:** Phase 1 defines `RoundRecord` without `drawCount`, or names fields differently from D-08. Phase 3 then has to patch the payload shape, causing a breaking change in the postMessage contract.

**Why it happens:** Phase 1 implementation optimizes for immediate needs and skips forward-compatibility.

**How to avoid:** Implement the full `SessionPayload` type as specified in D-08 during Phase 1, even if `completedAt` and `totalPlayTimeMs` are only populated at game end. Include `drawCount` in `RoundRecord` since it's part of the diagnostic data.

---

## Code Examples

Verified patterns from locked decisions and project architecture:

### Win Rate Effective Calculation
```typescript
// Effective win rate for a round with draw bonus
// Source: CONTEXT.md D-02, D-03, D-05
function effectiveWinRate(roundIndex: number, drawCount: number): number {
  const base = WIN_RATE_TABLE[roundIndex] ?? 0.50
  return Math.min(base + drawCount * DRAW_BONUS_PCT, 1.0)
}

// Round 2 (index 1) with 1 draw: 0.75 + 0.05 = 0.80
// Round 2 (index 1) with 2 draws: 0.75 + 0.10 = 0.85
// Round 2 with 3 draws: auto-win (no rate calculation needed)
```

### Outcome Matrix (exhaustive)
```typescript
// All 9 combinations — verifiable in unit tests
// Source: standard RPS rules, gameRules.ts
// Player: scissors vs AI: scissors → draw
// Player: scissors vs AI: rock     → lose (rock beats scissors)
// Player: scissors vs AI: paper    → win  (scissors beats paper)
// Player: rock     vs AI: scissors → win
// Player: rock     vs AI: rock     → draw
// Player: rock     vs AI: paper    → lose
// Player: paper    vs AI: scissors → lose
// Player: paper    vs AI: rock     → win
// Player: paper    vs AI: paper    → draw
```

### FSM Transition Table (for Phase 2 reducer reference)
```typescript
// Source: CONTEXT.md D-10, D-12
// Note: Phase 1 defines this as a type; Phase 2 implements the reducer
const TRANSITIONS = {
  idle:      { START: 'selecting' },
  selecting: { SELECT: 'revealing' },
  revealing: { REVEAL_DONE: 'result' },
  result:    {
    ADVANCE: 'selecting',   // win, round < 5
    // ADVANCE → 'victory' when round === TOTAL_ROUNDS - 1 after win
    // ADVANCE → 'gameover' on loss
    // ADVANCE → 'selecting' (same round) on draw
    RETRY: 'idle',
  },
  gameover:  { RETRY: 'idle' },
  victory:   { RETRY: 'idle' },
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `uuid` npm package | `crypto.randomUUID()` native | Node 14.17 / Chrome 92 (2021) | Zero-dependency UUID v4; no import needed |
| Next.js 15.2.4 (prior research) | Next.js 16.2.1 | October 2025 | `create-next-app@latest` now scaffolds 16.x; middleware API may differ |
| `framer-motion` import | `motion/react` import | 2024 package rename | Old import still works (shim) but `motion` is the canonical package |
| Vitest 2.x | Vitest 4.1.2 | 2025 | Node 24 compatible; `@types/node >=24.0.0` supported |

**Deprecated/outdated (from prior stack research):**
- Next.js 15.2.4: Superseded by 16.2.1 as of March 2026. Both support React 19.2.4 and App Router. The architecture patterns from ARCHITECTURE.md remain valid.

---

## Open Questions

1. **Next.js 16 Breaking Changes**
   - What we know: Next.js 16.0.0 released October 2025; 16.2.1 is current as of March 2026; peer deps still allow React 18/19
   - What's unclear: Whether any Next.js 16 changes affect game scaffolding (App Router structure, `next.config.ts`, middleware)
   - Recommendation: Run `create-next-app@latest` and inspect the scaffold output before writing config files. The game logic layer (`lib/rps/`) is framework-agnostic and unaffected.

2. **Draw Sub-probability Split**
   - What we know: D-04 says "나머지 15%는 완전 랜덤 (승리 또는 무승부)" — the remaining 15% is split between AI wins and draws
   - What's unclear: The exact split ratio within the 15% remainder (50/50 AI-win vs draw? Or all AI-win? Or weighted?)
   - Recommendation: Implement as 50/50 within the remainder (0.5 sub-roll threshold). This is the most natural interpretation of "완전 랜덤". Flag for product confirmation if the business cares about the exact draw probability.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All tooling | ✓ | v24.11.0 | — |
| npm | Package install | ✓ | 11.6.1 | — |
| `crypto.randomUUID()` | Session UUID | ✓ | Built-in (Node 14.17+) | — |
| Vitest (npx) | Unit tests | ✓ | 4.1.2 (via npx) | — |
| Next.js scaffold | Project bootstrap | ✓ | 16.2.1 (npm registry) | — |

**Missing dependencies with no fallback:** None — all required tools are available.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vitest.config.ts` — Wave 0 creation required |
| Quick run command | `npx vitest run src/lib/rps/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | `determineOutcome` covers all 9 RPS combinations | unit | `npx vitest run src/lib/rps/gameRules.test.ts` | Wave 0 |
| GAME-02 | `pickAiChoice` win-rate distribution matches table (statistical) | unit | `npx vitest run src/lib/rps/aiEngine.test.ts` | Wave 0 |
| GAME-02 | Draw bonus: each draw increases effective rate by 5% | unit | `npx vitest run src/lib/rps/aiEngine.test.ts` | Wave 0 |
| GAME-02 | Auto-win at 3 consecutive draws returns `LOSES_TO[playerChoice]` | unit | `npx vitest run src/lib/rps/aiEngine.test.ts` | Wave 0 |
| GAME-06 | Loss transitions to `gameover` phase type in state shape | unit | `npx vitest run src/lib/rps/types.test.ts` | Wave 0 |
| GAME-07 | Draw keeps same `round` value; increments `drawCount` | unit | `npx vitest run src/lib/rps/aiEngine.test.ts` | Wave 0 |
| GAME-08 | `RETRY` action type exists in `GameAction` union | unit | `npx vitest run src/lib/rps/types.test.ts` | Wave 0 |
| D-08 | `createSession()` returns UUID v4 format and ISO timestamps | unit | `npx vitest run src/lib/rps/session.test.ts` | Wave 0 |

**Note on GAME-02 statistical test:** Testing exact probability distribution requires a large sample (10,000+ rolls) and tolerance bands (e.g., ±3%). Use a deterministic approach: mock `Math.random` to return values just above and below the threshold and verify the correct choice is returned.

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/rps/`
- **Per wave merge:** `npx vitest run src/lib/rps/`
- **Phase gate:** All lib/rps tests green before Phase 2 begins

### Wave 0 Gaps

- [ ] `vitest.config.ts` — root config file (no test infra exists yet)
- [ ] `src/lib/rps/gameRules.test.ts` — 9 combination matrix (REQ GAME-01, GAME-04)
- [ ] `src/lib/rps/aiEngine.test.ts` — probability thresholds, draw bonus, auto-win (REQ GAME-02, GAME-07)
- [ ] `src/lib/rps/session.test.ts` — UUID format, ISO timestamps, finalize duration (REQ D-08)
- [ ] `src/lib/rps/types.test.ts` — type guard tests for Phase/GameAction (REQ GAME-06, GAME-08)

---

## Sources

### Primary (HIGH confidence)
- `npm view next version` — 16.2.1 current, verified 2026-03-30
- `npm view vitest version` — 4.1.2 current, verified 2026-03-30
- `npm view motion version` — 12.38.0 current, verified 2026-03-30
- `npm view zustand version` — 5.0.12 current, verified 2026-03-30
- `npm view canvas-confetti version` — 1.9.4 current, verified 2026-03-30
- MDN Web Crypto API — `crypto.randomUUID()` available all modern browsers, Node 14.17+
- `.planning/research/ARCHITECTURE.md` — FSM pattern, component structure (researched 2026-03-30)
- `.planning/research/STACK.md` — library versions and rationale (researched 2026-03-30)
- `.planning/research/PITFALLS.md` — client-side probability risks, session idempotency

### Secondary (MEDIUM confidence)
- `.planning/phases/01-game-logic/01-CONTEXT.md` — locked decisions D-01 through D-12 (user-confirmed)
- Vitest peer deps for Node 24 compatibility — `npm view vitest@4 peerDependencies`, verified

### Tertiary (LOW confidence)
- Next.js 16 migration notes — not fully researched; assumed backward-compatible App Router based on peer dep output showing same React versions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry 2026-03-30
- Architecture: HIGH — patterns from prior research + locked decisions from user discussion
- Pitfalls: HIGH — all pitfalls derived from locked decisions and known TypeScript/RPS logic patterns
- Test framework: HIGH — Vitest 4.1.2 confirmed compatible with Node 24.11.0

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable stack; re-verify Next.js version before scaffolding)
