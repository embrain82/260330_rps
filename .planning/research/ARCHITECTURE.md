# Architecture Research

**Domain:** HTML5 promotional mini-game (Rock-Paper-Scissors, single-player vs AI, coupon reward)
**Researched:** 2026-03-30
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Host Application Layer                       │
│  (parent app / iframe container / Next.js page route)           │
├─────────────────────────────────────────────────────────────────┤
│                     <RPSGame /> Root Component                   │
│  Props: onWin(roundsWon) | onExit() | embedded?: boolean        │
├──────────────┬──────────────────────────────────────────────────┤
│  Game Shell  │              Game State (useReducer FSM)          │
│  (layout /   │                                                   │
│   chrome)    │  phase: idle → selecting → revealing → result    │
│              │          → gameover | victory                     │
├──────────────┴──────────────────────────────────────────────────┤
│                         View Layer                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Idle /  │  │ Choice   │  │  Round   │  │  Game Over / │    │
│  │  Intro   │  │ Selector │  │  Result  │  │  Victory     │    │
│  │ Screen   │  │          │  │  Display │  │  Screen      │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                       Shared UI Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐              │
│  │ Progress │  │ Score /  │  │ Effect Layer     │              │
│  │ Tracker  │  │ Round    │  │ (Confetti / Shake│              │
│  │ (1-5)    │  │ Counter  │  │  / Emoji burst)  │              │
│  └──────────┘  └──────────┘  └──────────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                       Logic Layer (pure functions)               │
│  ┌─────────────────┐  ┌──────────────────┐                      │
│  │  AI Move Engine │  │  Win-Rate Table  │                      │
│  │  (weighted rand)│  │  [0.85, 0.75,    │                      │
│  │                 │  │   0.65, 0.55,    │                      │
│  │                 │  │   0.30]          │                      │
│  └─────────────────┘  └──────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `RPSGame` (root) | Public surface: receives config props, owns `useReducer` FSM, dispatches all actions | Client component with `'use client'` directive |
| `IntroScreen` | Start button, rules display, round count preview | Static presentational, receives `onStart` callback |
| `ChoiceSelector` | Renders 3 choice buttons (가위/바위/보), fires selection callback | Controlled display; 44px+ touch targets |
| `RoundResult` | Animates player vs AI reveal, shows win/lose/draw badge | Receives both choices and result; drives reveal animation |
| `ProgressTracker` | Row of round indicators (1–5) showing won/lost/pending | Pure display; receives `rounds` array |
| `ScoreBar` | Current round label and cumulative win count | Pure display |
| `GameOverScreen` | Loss state: shows AI choice that beat player, retry CTA | Presentational |
| `VictoryScreen` | Win state: confetti, coupon code display, share CTA | Fires `onWin` prop to parent; shows reward |
| `EffectLayer` | Mounts confetti or shake effects when phase transitions fire | Reacts to game phase in context; portal-rendered |
| `aiEngine` | Pure function: takes round index → returns weighted-random AI choice | No React; fully testable |
| `gameRules` | Pure function: takes player+AI choices → returns `win` / `lose` / `draw` | No React; fully testable |

## Recommended Project Structure

```
src/
├── app/
│   └── game/
│       └── page.tsx          # Next.js route for standalone embed URL
├── components/
│   └── rps-game/
│       ├── RPSGame.tsx        # Root; owns FSM state; public API
│       ├── IntroScreen.tsx    # Phase: idle
│       ├── ChoiceSelector.tsx # Phase: selecting
│       ├── RoundResult.tsx    # Phase: revealing / result
│       ├── ProgressTracker.tsx
│       ├── ScoreBar.tsx
│       ├── GameOverScreen.tsx # Phase: gameover
│       ├── VictoryScreen.tsx  # Phase: victory
│       ├── EffectLayer.tsx    # Portal-rendered effects
│       └── index.ts           # Re-exports RPSGame
├── lib/
│   └── rps/
│       ├── aiEngine.ts        # Weighted random AI choice
│       ├── gameRules.ts       # Outcome determination
│       ├── winRateTable.ts    # Per-round probability table
│       └── types.ts           # Shared types (Choice, Phase, RoundState)
└── styles/
    └── rps-game/
        └── animations.css     # CSS keyframes for shake, burst, bounce
```

### Structure Rationale

- **`components/rps-game/`:** All game UI is co-located under one folder. The `RPSGame.tsx` root acts as a self-contained widget — easy to import in any Next.js page or pass as children to a layout.
- **`lib/rps/`:** Pure game logic is separated from React entirely. This makes the win-rate table and AI engine independently testable without a DOM.
- **`app/game/page.tsx`:** A thin Next.js page that renders `<RPSGame onWin={...} />`. This URL can be iframe-embedded by external host apps.
- **`styles/rps-game/`:** CSS keyframe animations live outside component files so they load once and can be shared across components without duplication.

## Architectural Patterns

### Pattern 1: Finite State Machine via useReducer

**What:** The game has a fixed set of mutually exclusive phases. `useReducer` with a state-transition graph replaces ad-hoc `useState` booleans (`isRevealing`, `isGameOver`, etc.) that can reach impossible states.

**When to use:** Any UI with more than 2-3 sequential phases where illegal transitions must be prevented (e.g., cannot go from `revealing` directly to `victory` without passing through `result`).

**Trade-offs:** More boilerplate than `useState`; pays off immediately when debugging "how did we get here?" bugs.

**Example:**
```typescript
// lib/rps/types.ts
export type Phase =
  | 'idle'
  | 'selecting'
  | 'revealing'
  | 'result'
  | 'gameover'
  | 'victory'

export type GameAction =
  | { type: 'START' }
  | { type: 'SELECT'; choice: Choice }
  | { type: 'REVEAL_DONE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RETRY' }

// RPSGame.tsx (simplified)
const TRANSITIONS: Record<Phase, Partial<Record<GameAction['type'], Phase>>> = {
  idle:      { START: 'selecting' },
  selecting: { SELECT: 'revealing' },
  revealing: { REVEAL_DONE: 'result' },
  result:    { NEXT_ROUND: 'selecting', RETRY: 'idle' },
  gameover:  { RETRY: 'idle' },
  victory:   { RETRY: 'idle' },
}

function reducer(state: GameState, action: GameAction): GameState {
  const nextPhase = TRANSITIONS[state.phase]?.[action.type]
  if (!nextPhase) return state  // ignore invalid transitions silently

  // compute next data based on action type
  switch (action.type) {
    case 'SELECT':
      const aiChoice = pickAiChoice(state.round, WIN_RATE_TABLE)
      const outcome  = determineOutcome(action.choice, aiChoice)
      return { ...state, phase: nextPhase, playerChoice: action.choice, aiChoice, lastOutcome: outcome }
    // ...
  }
}
```

### Pattern 2: Pure AI Engine with Win-Rate Table

**What:** AI choice is a weighted random selection. The win-rate table is a plain array indexed by round (0–4). The AI engine is a pure function — no side effects, no React.

**When to use:** Always for probability-based game logic. Keeps randomness testable and the table editable without touching UI code.

**Trade-offs:** Client-side randomness is inspectable in DevTools. For an event promo with no real monetary stakes this is acceptable (and matches the project's explicit decision to keep it client-side).

**Example:**
```typescript
// lib/rps/winRateTable.ts
export const WIN_RATE_TABLE = [0.85, 0.75, 0.65, 0.55, 0.30] // round 1..5

// lib/rps/aiEngine.ts
export function pickAiChoice(round: number, playerChoice: Choice): Choice {
  const winRate   = WIN_RATE_TABLE[round] ?? 0.50
  const aiWins    = Math.random() > winRate        // player loses if true
  const aiDraws   = !aiWins && Math.random() < 0.15
  if (aiDraws) return playerChoice
  if (aiWins)  return BEATS[playerChoice]          // choice that beats player
  return LOSES_TO[playerChoice]                    // choice player beats
}
```

### Pattern 3: Phase-Driven View Switching

**What:** Instead of a complex router or conditional tree, the root `RPSGame` renders one screen component per phase. Phase is the single source of truth.

**When to use:** Mini-games and wizards with a clear linear flow and a small number of distinct screens.

**Trade-offs:** Simple and readable; does not support deep-linking to mid-game state (not needed for this project).

**Example:**
```typescript
// RPSGame.tsx
return (
  <div className="rps-game">
    <EffectLayer phase={state.phase} />
    {state.phase === 'idle'      && <IntroScreen onStart={dispatch} />}
    {state.phase === 'selecting' && <ChoiceSelector onSelect={(c) => dispatch({ type: 'SELECT', choice: c })} round={state.round} />}
    {state.phase === 'revealing' && <RoundResult {...state} onDone={() => dispatch({ type: 'REVEAL_DONE' })} />}
    {state.phase === 'result'    && <RoundResult {...state} onNext={() => dispatch({ type: 'NEXT_ROUND' })} />}
    {state.phase === 'gameover'  && <GameOverScreen {...state} onRetry={() => dispatch({ type: 'RETRY' })} />}
    {state.phase === 'victory'   && <VictoryScreen {...state} onWin={onWin} onRetry={() => dispatch({ type: 'RETRY' })} />}
    {(state.phase !== 'idle')    && <ProgressTracker rounds={state.rounds} />}
  </div>
)
```

## Data Flow

### Game Action Flow

```
User taps choice button
    ↓
ChoiceSelector fires onSelect(choice)
    ↓
RPSGame dispatches { type: 'SELECT', choice }
    ↓
reducer: phase idle→selecting→revealing
         calls aiEngine.pickAiChoice(round, choice)
         calls gameRules.determineOutcome(playerChoice, aiChoice)
         updates rounds[], lastOutcome, round counter
    ↓
React re-renders with new state
    ↓
RoundResult mounts, drives reveal animation (CSS / Framer Motion)
    ↓
onDone() fires after animation completes
    ↓
dispatch({ type: 'REVEAL_DONE' }) → phase: result
    ↓
If outcome === 'lose' → next NEXT_ROUND dispatch → phase: gameover
If outcome === 'win' && round < 5 → phase: selecting
If outcome === 'win' && round === 5 → phase: victory
    ↓ (victory path)
VictoryScreen renders, fires props.onWin(5)
    ↓
Parent app receives onWin → triggers coupon API call (outside game scope)
```

### State Shape

```typescript
interface GameState {
  phase:        Phase
  round:        number        // 0-indexed, 0..4
  rounds:       RoundRecord[] // [{playerChoice, aiChoice, outcome}]
  playerChoice: Choice | null
  aiChoice:     Choice | null
  lastOutcome:  'win' | 'lose' | 'draw' | null
}
```

### Key Data Flows

1. **Selection to Reveal:** Player choice triggers AI choice computation and outcome in a single synchronous reducer call. Both choices are held in state before the reveal animation starts.
2. **Effect triggering:** `EffectLayer` reads `phase` and `lastOutcome` from state. It mounts the confetti component when `phase === 'victory'` and a shake/sad animation when `phase === 'gameover'`. No direct parent-child prop drilling.
3. **Win event to parent:** `VictoryScreen` receives `onWin` as a prop passed from the root `RPSGame`. The root receives `onWin` from the page/host. This keeps the reward logic outside the game entirely.
4. **Embed communication:** When hosted as an iframe, the `app/game/page.tsx` route can call `window.parent.postMessage({ type: 'RPS_WIN' }, targetOrigin)` in the `onWin` handler, giving the parent app a cross-origin signal to issue the coupon.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single event, 0-10k plays | Current architecture — fully client-side, stateless server. No changes needed. |
| Persistent leaderboard or fraud prevention | Add a server-side endpoint to record plays. Validate outcomes server-side using a seeded random. |
| Multiple game variants / A-B test | Lift win-rate table to props or a server-fetched config. `RPSGame` becomes config-driven. |
| Reuse in multiple host apps | Publish as an NPM package. The component boundary is already clean — no Next.js internals leak out. |

### Scaling Priorities

1. **First bottleneck:** Client-side randomness is the primary attack surface if prizes have real value. Mitigation: move `pickAiChoice` to a signed server action that returns a commitment before the player reveals their choice.
2. **Second bottleneck:** If the VictoryScreen triggers a coupon API directly (vs. via parent callback), rate-limiting and deduplication become necessary. The current callback pattern defers this concern to the parent app, which is correct.

## Anti-Patterns

### Anti-Pattern 1: Scattered useState Booleans for Phase

**What people do:** `const [isRevealing, setIsRevealing] = useState(false)` plus `const [isGameOver, setIsGameOver] = useState(false)` — multiple booleans for phase control.

**Why it's wrong:** Creates impossible states (`isRevealing: true` and `isGameOver: true` simultaneously). Debugging becomes tracing which setter fired last.

**Do this instead:** Single `phase` field in a `useReducer` FSM. One source of truth; illegal combinations are structurally impossible.

### Anti-Pattern 2: Game Logic Inside Components

**What people do:** Write `Math.random()` and win/loss comparisons directly inside `onClick` handlers or `useEffect` blocks.

**Why it's wrong:** Untestable. Animation timing and game logic become entangled. Changing the win-rate table requires finding the right `useEffect`.

**Do this instead:** `aiEngine.ts` and `gameRules.ts` as pure functions in `lib/`. Components dispatch actions; reducers call logic functions.

### Anti-Pattern 3: Embedding as a New Next.js App

**What people do:** Create a separate Next.js project for the game, then embed it via iframe into the host.

**Why it's wrong:** Doubles the deployment surface, bundle load, and maintenance overhead for a 5-screen game.

**Do this instead:** A single Next.js route (`/game`) that renders the `<RPSGame />` component. The same component can also be imported directly by any page in the same app without an iframe.

### Anti-Pattern 4: Canvas or Game Engine for a Card-Selection Game

**What people do:** Reach for Phaser.js, PixiJS, or a canvas renderer because "it's a game."

**Why it's wrong:** RPS is a choice-and-reveal UI, not a physics or sprite-heavy game. Canvas adds complexity without benefit, breaks accessibility, and is harder to style responsively.

**Do this instead:** React DOM with CSS animations and a lightweight effect library (react-confetti-explosion). DOM-based rendering is correct for this domain.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Coupon / reward API | `onWin` prop callback → parent app fires API | Game emits event only; parent owns HTTP calls |
| Analytics (e.g., Mixpanel) | Dispatch tracking calls in `RPSGame` on phase transitions | Keep inside root component; do not leak into child screens |
| iframe host app | `window.parent.postMessage({ type: 'RPS_WIN', rounds: 5 }, origin)` in `onWin` | Parent listens with `window.addEventListener('message', ...)` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `RPSGame` ↔ child screens | Props down, callbacks up (React unidirectional) | No context needed — state lives at root; screens are shallow |
| `RPSGame` ↔ `EffectLayer` | Phase + outcome passed as props | EffectLayer uses `ReactDOM.createPortal` to render above layout |
| `reducer` ↔ `lib/rps/` | Direct function calls inside reducer | Pure functions; reducer orchestrates, lib computes |
| `app/game/page.tsx` ↔ `RPSGame` | Props only (`onWin`, `embedded` flag) | Page is a thin adapter; all logic stays in the component |

## Build Order (Phase Dependencies)

The component boundaries define a natural build sequence with no circular dependencies:

```
1. lib/rps/ (types, gameRules, aiEngine, winRateTable)
        ↓ (logic layer — no React dependency)
2. ProgressTracker, ScoreBar
        ↓ (stateless display atoms — no game logic dependency)
3. ChoiceSelector, RoundResult
        ↓ (interactive atoms — depend on types only)
4. IntroScreen, GameOverScreen, VictoryScreen
        ↓ (phase screens — depend on atoms and types)
5. EffectLayer
        ↓ (depends on phase type only)
6. RPSGame (root)
        ↓ (assembles everything; owns FSM)
7. app/game/page.tsx
        ↓ (Next.js route; thin adapter)
```

Build in this order: each layer depends only on layers above it. Testing is possible at each layer independently.

## Sources

- [Using React in web games — LogRocket Blog](https://blog.logrocket.com/using-react-web-games/) — Component hierarchy and data flow patterns (MEDIUM confidence)
- [Building a mini casual game with Next.js — lansolo.dev](https://www.lansolo.dev/posts/building-a-mini-casual-game-with-nextjs) — Context API + Framer Motion pattern in production Next.js game (MEDIUM confidence)
- [How to Use useReducer as a Finite State Machine — Kyle Shevlin](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) — FSM reducer pattern (HIGH confidence, authoritative)
- [react-confetti-explosion — npm](https://www.npmjs.com/package/react-confetti-explosion) — Lightweight CSS-based confetti for win effects (HIGH confidence)
- [Motion (Framer Motion) React Animation Docs](https://motion.dev/docs/react-animation) — Animation system for reveal transitions (HIGH confidence, official docs)
- [State Machines in React — mastery.games](https://mastery.games/post/state-machines-in-react/) — Game-specific FSM patterns in React (MEDIUM confidence)

---
*Architecture research for: HTML5 promotional Rock-Paper-Scissors mini-game (Next.js + React)*
*Researched: 2026-03-30*
