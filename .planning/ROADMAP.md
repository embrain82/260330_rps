# Roadmap: RPS Challenge v1.1 Bug Fixes

## Overview

Single phase delivers all 4 bug fixes for the v1.0 game. All fixes are independent CSS/animation/timing issues that don't affect game logic. Phase 4 continues numbering from the v1.0 milestone.

## Phases

**Phase Numbering:**
- Phases 1-3: v1.0 milestone (complete)
- Phase 4: v1.1 bug fixes

- [ ] **Phase 4: Bug Fixes** - Fix effects triggering, mobile layout, and card flip animation

## Phase Details

### Phase 4: Bug Fixes
**Goal**: All 4 reported bugs are fixed — effects fire correctly, mobile layout is usable, and card flip hides AI choice during rotation
**Depends on**: v1.0 (Phases 1-3 complete)
**Requirements**: BFIX-01, BFIX-02, BFIX-03, BFIX-04
**Plans**: 3 plans
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. 5라운드 전승 시 화면에 폭죽 이펙트가 표시된다
  2. 패배 시 화면에 shake/desaturate 이펙트가 표시된다
  3. 모바일 브라우저(360px)에서 선택 버튼 3개가 주소창에 가려지지 않고 전부 보이고 탭 가능하다
  4. AI 카드 회전 애니메이션 중에는 뒷면(물음표)만 보이고, 회전 완료 후에만 AI 선택이 노출된다

Plans:
- [ ] 04-01-PLAN.md — Fix confetti and defeat effects timing (BFIX-01, BFIX-02)
- [ ] 04-02-PLAN.md — Fix mobile viewport layout for choice buttons (BFIX-03)
- [ ] 04-03-PLAN.md — Fix AI card flip backface visibility (BFIX-04)

## Progress

**Execution Order:**
Phase 4 plans can execute in parallel (independent fixes).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 4. Bug Fixes | 0/3 | Ready for execution | - |
