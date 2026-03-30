---
phase: 1
slug: game-logic
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | GAME-01 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-06 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-07 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@types/node` — test framework install
- [ ] `vitest.config.ts` — vitest config
- [ ] `src/lib/rps/__tests__/` — test directory structure

*Test file stubs created as part of planning.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Choice images displayed | GAME-03 | Visual output — Phase 2 | Verify in browser after Phase 2 |
| Round counter display | GAME-05 | Visual output — Phase 2 | Verify in browser after Phase 2 |
| Restart button | GAME-08 | UI interaction — Phase 2 | Verify in browser after Phase 2 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
