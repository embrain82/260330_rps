---
phase: 02
slug: ui-effects
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-30
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` (exists, needs update for jsdom + react plugin) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Type check command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~5 seconds (vitest), ~10 seconds (tsc) |

---

## Verification Strategy

This phase uses a **two-tier verification approach**:

1. **Unit tests (Vitest)** for game store FSM logic — the behavioral core that must be correct.
2. **TypeScript compilation (`npx tsc --noEmit`)** for UI/effect components — these are visual/interactive components where type safety validates correct prop contracts, imports, and wiring. Component behavior is verified via the Task 3 human-verify checkpoint in Plan 03.

Rationale: UI animation components (ChoiceCard flip, SuspenseReveal shuffle, confetti bursts) produce visual output that is not meaningfully testable with DOM assertions. Type checking ensures structural correctness (correct imports, prop interfaces, store selectors), while the visual checkpoint validates runtime behavior.

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose` AND `npx tsc --noEmit`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green + tsc clean
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | UI-03 | infra | `npx vitest run --reporter=verbose` | existing | ⬜ pending |
| 02-01-02 | 01 | 1 | FX-03, FX-04 | unit | `npx vitest run src/store/__tests__/gameStore.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | UI-01, UI-02 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 02-02-01 | 02 | 2 | FX-04, UI-01 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 02-02-02 | 02 | 2 | UI-02 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 02-03-01 | 03 | 3 | FX-01, FX-02, FX-03 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 02-03-02 | 03 | 3 | UI-03 | type-check | `npx tsc --noEmit` | N/A | ⬜ pending |
| 02-03-03 | 03 | 3 | ALL | visual | human-verify checkpoint | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Update `vitest.config.ts` — add `@vitejs/plugin-react`, change environment to `jsdom`, add setupFiles
- [ ] Create `src/__tests__/setup.ts` — import `@testing-library/jest-dom`
- [ ] Create `src/__mocks__/motion/react.tsx` — pass-through mock for motion components
- [ ] Create `src/store/__tests__/gameStore.test.ts` — FSM transition tests
- [ ] Install test dependencies: `npm install -D @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom`

*Component-level unit tests (ChoiceButton, Game, Confetti, DefeatEffect) are not required for this phase. Type checking (`npx tsc --noEmit`) validates component contracts, and the human-verify checkpoint (Plan 03, Task 3) validates visual/interactive behavior.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Initial load under 3 seconds | UI-03 | Requires real browser + network | `npx next build && npx next start`, check Lighthouse Performance score |
| Full 5-round game playable at 360px | UI-01 | Visual + interaction verification | Open in Chrome DevTools mobile view (360px), play full game |
| Confetti visual quality | FX-01 | Subjective visual verification | Play to 5-round win, confirm multi-burst confetti |
| Suspense animation timing | FX-03 | Timing feel is subjective | Play round, verify ~1.5s shuffle feels natural |
| SuspenseReveal -> revealDone flow | FX-03 | Animation completion triggers store action | Play round, verify game does NOT get stuck in revealing phase |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (vitest or tsc --noEmit)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
