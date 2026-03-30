# Project Research Summary

**Project:** HTML5 가위바위보 챌린지 (RPS Promotional Mini-Game)
**Domain:** HTML5 promotional mini-game, single-player vs AI, coupon reward integration
**Researched:** 2026-03-30
**Confidence:** HIGH

## Executive Summary

This is a lightweight promotional mini-game — a 5-round rock-paper-scissors game with a degrading win probability curve (round 1: 85%, round 5: 30%) that rewards coupon issuance on full clear. The recommended approach is a pure client-side React implementation using Next.js 15 App Router, with game logic cleanly separated from UI via a useReducer finite state machine. No server is needed for core game logic; coupon issuance is delegated to the parent application via a postMessage callback contract. This separation is critical: the game emits a win event with a session UUID, and the parent app's backend owns coupon issuance and idempotency.

The technical stack is well-settled. Next.js 15 + React 19 + Tailwind v4 are the project constraints, and all three are confirmed production-stable. The addition of Zustand v5, motion v12, and canvas-confetti covers all state, animation, and celebration effect needs with minimal bundle overhead — no game engines, no canvas rendering, no heavy third-party frameworks. The entire game is a DOM-based UI with CSS animations, which is architecturally correct for a choice-and-reveal interaction pattern and avoids both the bundle overhead and accessibility problems of canvas-based approaches.

The primary risk is coupon fraud via client-side probability manipulation and win-event replay. Both are addressable without server-side game logic: the game must assign a session UUID at load time and include it in the win payload, the parent backend must enforce idempotency on that UUID, and the game itself must lock all input buttons during every non-CHOOSING phase to prevent state corruption. iOS Safari viewport height (`dvh` not `vh`) and mid-range Android animation performance (transform/opacity only, canvas-confetti not DOM particles) are implementation-level pitfalls with known fixes that must be applied from the start, not retrofitted.

---

## Key Findings

### Recommended Stack

The stack is constrained by the project and confirmed appropriate. Next.js 15 App Router with React 19 client components is the correct frame — game components use `'use client'` and there is no meaningful SSR work to do for a purely interactive game. Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) handles all styling and is significantly faster to iterate than v3. Zustand v5 manages game state with selective subscriptions that prevent re-renders during animations.

For animation, `motion` v12 (formerly framer-motion, imported from `motion/react`) handles stateful UI transitions — simultaneous choice reveal, round progression, result display. For the victory confetti, `canvas-confetti` renders off-DOM on a canvas element with `useWorker: true`, keeping the fireworks effect smooth on mobile without layout thrashing. TypeScript 5.7+ is bundled via Next.js with native `next.config.ts` support.

**Core technologies:**
- Next.js 15.2.4: App Router framework and deployment host — project constraint, `generateViewport` handles mobile viewport declaratively
- React 19.2.4: UI component model — project constraint, client components with `'use client'` for all game screens
- Tailwind CSS v4: Utility-first responsive styling — CSS-first config, 5x faster rebuild than v3, no config file needed
- Zustand v5.0.12: Client-side game state store — React 19 native via `useSyncExternalStore`, prevents prop drilling across the component tree
- motion v12: Reveal and transition animations — import from `motion/react` (NOT `framer-motion`), declarative variants model fits FSM-driven state transitions
- canvas-confetti v1.x: Victory fireworks effect — canvas-rendered, `useWorker: true` for off-main-thread execution on mobile

### Expected Features

**Must have (table stakes):**
- Three-button choice input (가위/바위/보) with 44px+ touch targets — core mechanic, absence causes immediate abandonment
- AI choice generator with per-round probability curve (R1:85%, R2:75%, R3:65%, R4:55%, R5:30%) — the defining tension architecture
- Simultaneous player+AI choice reveal with animation — required for perceived fairness
- Clear win/lose/draw outcome display using text + color + icon — color alone violates accessibility
- Round counter / progress indicator (1 of 5) — required for tension pacing
- 5-round elimination structure (one loss ends the session) — the stakes that make round 5 meaningful
- Win celebration screen with fireworks effect and coupon display area
- Defeat screen with prominent "Try Again" CTA
- postMessage win callback (`{ event: 'GAME_WIN', sessionId: uuid }`) for coupon integration
- Mobile-first responsive layout, portrait-optimized, 360px+ width

**Should have (competitive differentiators):**
- Reveal suspense animation (1-2s delay before AI choice shown) — tension driver; makes round 5 at 30% feel momentous
- Defeat "disappointment" effect (CSS shake + desaturate) — emotional honesty; differentiates from generic flat game-over
- Smooth between-round transition (800ms pause + animation) — promo-quality polish vs. hobbyist feel
- Sound effects off by default, triggered only by user gesture — Web Audio API; must respect autoplay policy in iframe context
- Haptic feedback via Vibration API (v1.x) — not iOS Safari supported, Android only

**Defer (v2+):**
- Leaderboard and win-streak tracking — requires auth + backend + GDPR/Korean privacy law compliance
- Social share integration — KakaoTalk/Instagram APIs are fragmented; only add when specific target is defined
- Analytics event hooks (`onRoundEnd`, `onGameEnd` callbacks) — add when parent services need event instrumentation
- Configurable win-rate curve via props — enables A/B testing; only needed when multiple campaigns are live

### Architecture Approach

The recommended architecture is a self-contained React widget (`<RPSGame />`) with its own `useReducer` finite state machine controlling six mutually exclusive phases: `idle → selecting → revealing → result → gameover | victory`. All game logic (AI weighted random, outcome determination, win-rate table) lives in pure functions in `lib/rps/` with no React dependency, making them independently testable. The root component owns the FSM and passes props down to shallow screen components; no context API is needed. An `EffectLayer` component renders confetti and shake effects via `ReactDOM.createPortal`. For iframe embedding, `app/game/page.tsx` is a thin adapter that fires `window.parent.postMessage` in the `onWin` handler.

**Major components:**
1. `RPSGame` (root) — owns `useReducer` FSM, public API surface (`onWin`, `embedded` props), dispatches all actions
2. `ChoiceSelector` — renders 3 choice buttons, locked during any non-selecting phase
3. `RoundResult` — animates simultaneous reveal of player and AI choices, drives reveal animation sequence
4. `ProgressTracker` / `ScoreBar` — pure display atoms showing round progression (1–5)
5. `GameOverScreen` / `VictoryScreen` — phase-specific end screens; VictoryScreen fires `onWin` prop
6. `EffectLayer` — portal-rendered; mounts confetti on `victory`, shake effect on `gameover`
7. `lib/rps/aiEngine.ts`, `gameRules.ts`, `winRateTable.ts` — pure functions, zero React dependency

**Build order (no circular dependencies):**
1. `lib/rps/` types + pure logic first
2. Stateless display atoms (ProgressTracker, ScoreBar)
3. Interactive atoms (ChoiceSelector, RoundResult)
4. Phase screens (IntroScreen, GameOverScreen, VictoryScreen)
5. EffectLayer
6. RPSGame root (assembles all)
7. `app/game/page.tsx` route adapter

### Critical Pitfalls

1. **Client-side probability manipulation** — compute AI choice atomically in one pure function with no intermediate variable exposure; accept minification as the practical security layer; ensure coupon issuance is server-side and uses the session UUID as an idempotency key; never include the coupon code in the win postMessage payload
2. **Touch double-fire and button spam** — use React `onClick` only (never add `onTouchEnd`); implement a `gamePhase` enum and set `pointer-events: none` on all choice buttons during every non-CHOOSING phase; re-enable only after `onAnimationEnd` fires on the reveal sequence
3. **CSS animation jank on mid-range Android** — animate exclusively via `transform` and `opacity` (never `width`, `height`, `top`, `left`, `margin`, `box-shadow`); use `canvas-confetti` (canvas, not DOM particles) for victory effect; test with Chrome DevTools 4x CPU throttle before shipping
4. **iOS Safari viewport height** — use `dvh` (not `vh`) for all full-screen containers; add `viewport-fit=cover` to viewport meta and `padding-bottom: env(safe-area-inset-bottom)` to the bottom action bar; apply from the start, not as a post-launch fix
5. **Coupon replay and duplicate issuance** — generate a UUID session ID at game load; include it in the win payload; backend must treat session ID as idempotency key; game UI must set an `issuancePending` flag and disable all interaction on game completion

---

## Implications for Roadmap

Based on research, the architecture has a clear dependency order that maps directly to a 3-phase roadmap. No phase depends on work from a later phase.

### Phase 1: Core Game Logic and State Machine

**Rationale:** Pure functions and the FSM design must be established before any UI work. The win-rate table, AI engine, and phase transition graph cannot be changed without impacting all downstream components. The security and idempotency contracts (session UUID, postMessage payload shape) must also be defined here before integration points are built.

**Delivers:** Fully functional game logic in isolation; type definitions used by all later components; a working FSM that correctly enforces all phase transitions; session UUID generation.

**Addresses features:** Per-round probability curve, AI choice generator, outcome determination, 5-round elimination structure.

**Avoids pitfalls:** Client-side probability manipulation (single atomic function, no intermediate state leakage); touch double-fire (phase enum prevents illegal state); coupon replay (session UUID defined here).

### Phase 2: UI Components and Animation

**Rationale:** All screen components and animations depend on the types and phase enum from Phase 1. Mobile layout rules (dvh, safe-area-inset) and animation performance rules (transform/opacity only) must be established at the start of UI work, not retrofitted.

**Delivers:** Complete playable game in a browser — all screens, all transitions, reveal animation, celebration effect, defeat effect, progress tracker, responsive mobile layout.

**Uses stack elements:** motion v12 for reveal/transition animations; canvas-confetti for victory fireworks; Tailwind v4 for all responsive layout; Zustand v5 if state needs to cross component boundaries.

**Implements architecture:** All components from ChoiceSelector through EffectLayer; RPSGame root component assembling the FSM-driven view layer.

**Avoids pitfalls:** CSS jank on Android (transform/opacity rule enforced from day 1); iOS Safari viewport (dvh from day 1); no DOM-based confetti particles.

### Phase 3: Embed Integration and Coupon Contract

**Rationale:** Integration work (postMessage protocol, iframe height reporting, CORS headers) depends on a working game. Defining the embed interface is Phase 3 because it is the deployment surface, not the game itself.

**Delivers:** iframe-embeddable game at `/game` route; postMessage win event with session UUID; iframe height reporting messages; validated origin checking; `next.config.ts` headers for X-Frame-Options; documentation of postMessage event contract for parent app integration.

**Addresses features:** postMessage win callback, iframe embed support, CSS containment (no global style leakage to parent).

**Avoids pitfalls:** postMessage origin not validated (explicit origin whitelist in parent listener); iframe embed height broken (height postMessages from game on phase transitions); coupon payload contract (session ID only, no coupon code in payload).

### Phase Ordering Rationale

- Phase 1 must precede Phase 2 because all component types and the phase enum are defined in `lib/rps/`; components import these types
- Phase 2 must precede Phase 3 because the embed interface wraps a working game; there is nothing to embed until Phase 2 completes
- This ordering matches the build dependency graph documented in ARCHITECTURE.md exactly
- The security and fraud mitigation decisions (session UUID, idempotency key contract) are made in Phase 1 even though they are exercised in Phase 3 — they cannot be added later without changing the win payload shape

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** postMessage security patterns and iframe resizing protocol have nuance in specific parent app contexts (Toss, KakaoTalk webviews, etc.). If a specific parent platform is known, research that platform's webview postMessage behavior before implementation.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Pure TypeScript game logic + useReducer FSM is a fully documented, high-confidence pattern. No novel technology.
- **Phase 2:** React component structure, motion v12 animations, canvas-confetti, Tailwind v4 layout — all patterns are well-documented in official sources with high confidence. Standard execution.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies confirmed via official sources and current npm metadata. Version pairs verified. motion v12 rename confirmed via official upgrade guide. |
| Features | HIGH (core), MEDIUM (promo-specific) | Core game mechanics are universal. Probability curve design and postMessage integration patterns sourced from production examples but not audited directly. |
| Architecture | HIGH | FSM via useReducer is a well-documented authoritative pattern. Component structure follows established React widget patterns. Pure function separation from UI is industry standard. |
| Pitfalls | HIGH (technical), MEDIUM (security/fraud) | CSS animation, touch event, and iOS viewport pitfalls are from official and high-confidence sources. Fraud pattern severity estimates are from industry security blogs, not direct empirical data. |

**Overall confidence:** HIGH

### Gaps to Address

- **Win-rate curve calibration:** The probability values (85%/75%/65%/55%/30%) are research-derived but untested against real user behavior. The theoretical full-clear rate is ~9%. Whether that conversion rate is appropriate for the specific promotion requires validation through usage data after launch.
- **Parent app platform specifics:** If the game will be embedded in a specific platform (Toss, KakaoTalk, custom webview), the postMessage and iframe integration behavior should be verified against that platform's documented constraints before Phase 3 begins.
- **Sound design scope:** Whether to invest in sound effects for v1 is unresolved. Decision should be deferred to after core game is working; if user testing shows audio desire, add via Web Audio API with user-gesture trigger requirement.
- **Coupon backend contract:** The game emits a win event; the backend owns coupon issuance. The exact backend API contract (endpoint, session validation logic, rate limiting) is outside the game's scope but must be agreed upon with the parent app team before Phase 3 integration.

---

## Sources

### Primary (HIGH confidence)
- Next.js official blog — Next.js 15 feature overview, App Router, generateViewport API
- React dev blog — React 19.2.x stable release confirmation
- Tailwind CSS blog — v4 stable release, CSS-first config
- motion.dev docs — v12 upgrade guide, import path from `motion/react`
- Zustand (pmnd.rs) — v5 announcement, React 19 native compatibility
- canvas-confetti GitHub — useWorker option, API reference
- MDN Web Docs — Window.postMessage(), Vibration API, animation performance, dvh viewport unit
- Kyle Shevlin — useReducer as FSM (authoritative blog post)
- Chrome for Developers — 300ms tap delay elimination

### Secondary (MEDIUM confidence)
- Genieee.com — HTML5 game UI/UX best practices
- Voucherify blog — gamified promotions psychology and campaign patterns
- Gamedev.js — mobile-friendly HTML5 game best practices
- Bram.us — large/small/dynamic viewport units
- LogRocket blog — React in web games, component hierarchy patterns
- lansolo.dev — production Next.js mini-game pattern (Context API + Framer Motion)
- Fingerprint.com — coupon and promo abuse prevention
- Catchmetrics — Next.js bundle optimization 2025

### Tertiary (LOW confidence)
- Red Apple Technologies (Medium) — mobile game UX design trends 2025 (undated, single source)
- react-confetti-explosion npm — CSS-only alternative to canvas-confetti (confirmed existence, not deeply evaluated)

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
