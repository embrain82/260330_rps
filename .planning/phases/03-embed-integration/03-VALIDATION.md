---
phase: 03
slug: embed-integration
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-30
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 + jsdom + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Type check command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~5 seconds |

---

## Verification Strategy

This phase uses **unit tests + type checking**:

1. **Unit tests (Vitest)** for postMessage hook logic (send/receive/origin validation) and coupon display logic (ResultScreen conditional rendering).
2. **TypeScript compilation** for config files and wiring correctness.
3. **Manual verification** for iframe embedding and CSS containment (via test-embed.html).

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green + tsc clean
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | INTG-02, INTG-03 | unit | `npx vitest run src/hooks/__tests__/usePostMessage.test.ts` | No - W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | INTG-01 | unit | `npx vitest run src/components/screens/__tests__/ResultScreen.test.tsx` | No - W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | INTG-03 | unit | `npx vitest run src/store/__tests__/gameStore.test.ts` | Exists (extend) | ⬜ pending |
| 03-01-04 | 01 | 1 | INTG-03 | manual | Load test-embed.html | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Create `src/hooks/__tests__/usePostMessage.test.ts` — postMessage send/receive/origin validation
- [ ] Create `src/components/screens/__tests__/ResultScreen.test.tsx` — coupon display conditional rendering
- [ ] Extend `src/store/__tests__/gameStore.test.ts` — couponConfig persistence across retry()

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| iframe loads without blocking | INTG-03 | Requires actual browser iframe | Open test-embed.html, verify game renders in iframe |
| CSS containment, no style leakage | INTG-03 | Visual verification | Check parent page styles unaffected by game |
| Coupon image renders correctly | INTG-01 | Visual verification | Send coupon config with image URL from test page |
| postMessage received by parent | INTG-02 | End-to-end verification | Win game in iframe, check log panel in test page |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (vitest or tsc --noEmit)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
