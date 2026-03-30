---
phase: 02
slug: ui-effects
status: draft
nyquist_compliant: false
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
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | FX-03, FX-04 | unit | `npx vitest run src/store/__tests__/gameStore.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | UI-01 | unit | `npx vitest run src/components/ui/__tests__/ChoiceButton.test.tsx` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 0 | UI-02 | unit | `npx vitest run src/components/__tests__/Game.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | FX-01 | unit | `npx vitest run src/components/effects/__tests__/Confetti.test.tsx` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | FX-02 | unit | `npx vitest run src/components/effects/__tests__/DefeatEffect.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Update `vitest.config.ts` — add `@vitejs/plugin-react`, change environment to `jsdom`, add setupFiles
- [ ] Create `src/__tests__/setup.ts` — import `@testing-library/jest-dom`
- [ ] Create `src/__mocks__/motion/react.tsx` — pass-through mock for motion components
- [ ] Create `src/store/__tests__/gameStore.test.ts` — FSM transition tests
- [ ] Create `src/components/__tests__/Game.test.tsx` — screen rendering tests
- [ ] Create `src/components/ui/__tests__/ChoiceButton.test.tsx` — touch target and interaction tests
- [ ] Install test dependencies: `npm install -D @vitejs/plugin-react @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom`

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Initial load under 3 seconds | UI-03 | Requires real browser + network | `npx next build && npx next start`, check Lighthouse Performance score |
| Full 5-round game playable at 360px | UI-01 | Visual + interaction verification | Open in Chrome DevTools mobile view (360px), play full game |
| Confetti visual quality | FX-01 | Subjective visual verification | Play to 5-round win, confirm multi-burst confetti |
| Suspense animation timing | FX-03 | Timing feel is subjective | Play round, verify ~1.5s shuffle feels natural |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
