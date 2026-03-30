# Roadmap: RPS Challenge (가위바위보 챌린지)

## Overview

Three phases deliver a complete embeddable promotional mini-game. Phase 1 establishes the core game logic and finite state machine in pure TypeScript — no UI, no React, just the rules and state transitions that everything else depends on. Phase 2 assembles the full playable game: all screen components, animations, effects, and mobile layout. Phase 3 wraps the working game in an embed-safe container and defines the postMessage coupon contract, making it deployable in any parent app via iframe.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Game Logic** - Core game rules, AI engine, and finite state machine in pure TypeScript
- [ ] **Phase 2: UI & Effects** - All playable screens, animations, effects, and mobile layout
- [ ] **Phase 3: Embed & Integration** - iframe embed, postMessage coupon contract, deployment surface

## Phase Details

### Phase 1: Game Logic
**Goal**: The complete game rules are encoded and testable in isolation — AI makes correct probabilistic choices, all phase transitions are enforced, and a session UUID is generated
**Depends on**: Nothing (first phase)
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07, GAME-08
**Plans**: 3 plans
**Success Criteria** (what must be TRUE):
  1. A player choice (가위/바위/보) produces a deterministic outcome (win/lose/draw) against an AI choice
  2. The AI's win probability matches the configured curve: round 1 at 85%, round 2 at 75%, round 3 at 65%, round 4 at 55%, round 5 at 30%
  3. A loss immediately ends the session (no further rounds possible)
  4. A draw repeats the same round number without advancing the counter
  5. A session UUID is assigned at game start and persists through the full session

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js project, install Vitest, define types.ts and constants.ts
- [x] 01-02-PLAN.md — Implement determineOutcome (gameRules.ts) and pickAiChoice (aiEngine.ts) with TDD
- [x] 01-03-PLAN.md — Implement session.ts (createSession/finalizeSession) and phase gate verification

### Phase 2: UI & Effects
**Goal**: The game is fully playable in a browser — all screens render, all animations fire, mobile layout works at 360px+, and the full 5-round experience is completeable
**Depends on**: Phase 1
**Requirements**: FX-01, FX-02, FX-03, FX-04, UI-01, UI-02, UI-03
**Plans**: 3 plans
**Success Criteria** (what must be TRUE):
  1. Player can tap 가위/바위/보 buttons (44px+ touch targets) and see both their choice and the AI's choice revealed simultaneously with animation
  2. A 1-2 second suspense animation plays before the AI choice is revealed each round
  3. Winning all 5 rounds triggers a confetti/fireworks effect on the victory screen
  4. Losing any round triggers a shake + desaturate effect on the game-over screen
  5. The game is fully playable and visually correct on a 360px-wide mobile viewport

Plans:
- [x] 02-01-PLAN.md — Install dependencies, test infra, Zustand game store, CSS theme, SVG icons
- [x] 02-02-PLAN.md — Atomic UI components (ChoiceButton, ChoiceCard, RoundIndicator) and screen components (Idle, Play, Result)
- [x] 02-03-PLAN.md — Effects (Confetti, DefeatEffect, SuspenseReveal), Game.tsx shell with AnimatePresence, page.tsx dynamic import, visual checkpoint

### Phase 3: Embed & Integration
**Goal**: The game runs inside an iframe on any parent page, fires a postMessage win event with the session UUID on full-clear, and displays a coupon reward screen
**Depends on**: Phase 2
**Requirements**: INTG-01, INTG-02, INTG-03
**Success Criteria** (what must be TRUE):
  1. The game loads correctly inside an iframe with no style leakage to the parent page
  2. Winning all 5 rounds displays a coupon code/image victory screen
  3. Winning all 5 rounds fires a postMessage event to the parent window containing the session UUID
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Game Logic | 3/3 | Complete |  |
| 2. UI & Effects | 0/3 | Ready for execution | - |
| 3. Embed & Integration | 0/TBD | Not started | - |
