# RPS Challenge (가위바위보 챌린지)

## What This Is

앱/서비스 내 임베드되는 가위바위보 미니게임. 참여자가 AI와 최대 5판까지 대결하며, 판수가 올라갈수록 승률이 떨어지는 구조로 긴장감을 높인다. 최종 승리 시 쿠폰을 지급하는 이벤트/프로모션용 게임.

## Core Value

"한 판 더" 도전하고 싶은 긴장감 있는 게임 경험 — 참여자가 끝까지 이기면 보상을 받는 구조.

## Requirements

### Validated

- ✓ 가위/바위/보 선택 후 AI 대결 및 승패 판정 로직 — Phase 1
- ✓ 판수별 차등 승률 (85%, 75%, 65%, 55%, 30%) — Phase 1
- ✓ 최대 5판 연승 구조 (지면 즉시 종료, 무승부 반복) — Phase 1
- ✓ 세션 관리 (UUID, 타임스탬프, 라운드 기록) — Phase 1
- ✓ 참여자와 AI의 선택 이미지 동시 표시 — Phase 2
- ✓ 승리 시 폭죽 이펙트, 패배 시 아쉬움 이펙트 — Phase 2
- ✓ 모바일 우선 반응형 UI — Phase 2
- ✓ 생동감 있는 게임 스타일 UI (애니메이션, 풍부한 색감) — Phase 2
- ✓ 최종 승리 시 쿠폰 지급 화면 (코드/이미지/텍스트 조건부 표시) — Phase 3
- ✓ iframe 임베딩 (CSP frame-ancestors, CSS containment) — Phase 3
- ✓ postMessage 양방향 통신 (쿠폰 수신, 승리 이벤트 발행) — Phase 3

### Active

- [ ] 승리 시 폭죽(confetti) 이펙트가 실제로 트리거되도록 수정
- [ ] 패배 시 아쉬움 이펙트가 실제로 트리거되도록 수정
- [ ] 모바일 하단 주소창에 가위바위보 선택 버튼이 가려지지 않도록 viewport 높이 조정
- [ ] AI 카드 플립 애니메이션 중 결과가 미리 보이지 않도록 backface-visibility 수정

## Current Milestone: v1.1 Bug Fixes

**Goal:** v1.0 게임의 핵심 버그 3건을 수정하여 의도한 게임 경험을 완성

**Target fixes:**
- 이펙트 미작동 (승리 폭죽 + 패배 아쉬움)
- 모바일 선택 버튼 주소창 가림 현상
- AI 카드 플립 시 결과 사전 노출

### Out of Scope

- 멀티플레이어 (PvP) — 단일 플레이어 vs AI 구조만
- 실시간 서버 통신 — 승률 계산은 클라이언트 사이드
- 사용자 로그인/인증 — 게임 자체에는 인증 불필요 (쿠폰 지급 시 외부 연동)
- 리더보드/랭킹 — v1에서는 개인 플레이만

## Context

- **용도**: 앱/서비스 내 미니게임으로 임베드. 이벤트/프로모션 맥락에서 사용.
- **기술 스택**: Next.js + React, TypeScript
- **플랫폼**: 모바일 우선, 데스크톱 기본 지원
- **보상 구조**: 5판 모두 이기면 최종 승리 쿠폰 지급. 중간에 지면 게임 오버.
- **승률 설계**: 판수가 올라갈수록 AI가 유리해짐. 5판은 30%로 극적인 난이도.
- **UI 톤**: 생동감 있고 재미있는 게임 느낌. 애니메이션, 이펙트 활용.

## Constraints

- **Tech**: Next.js + React + TypeScript
- **Platform**: 모바일 우선 반응형 — 최소 터치 타겟 44px
- **Performance**: 이미지/애니메이션은 CSS 기반 또는 경량 라이브러리 — 무거운 게임 엔진 사용 금지
- **Embed**: iframe 또는 컴포넌트로 외부 서비스에 임베드 가능해야 함

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 승률 계산을 클라이언트에서 처리 | 서버 왕복 없이 빠른 게임 플레이. 이벤트용이므로 보안 요구 낮음 | ✓ Validated — Phase 1 |
| CSS 애니메이션 + 이모지/SVG 기반 이펙트 | 별도 게임 엔진 없이 경량으로 생동감 있는 연출 가능 | ✓ Validated — Phase 2 |
| 쿠폰 지급은 API 콜백 인터페이스만 정의 | 실제 쿠폰 시스템은 외부이므로, 게임은 "승리" 이벤트만 발행 | ✓ Validated — Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after milestone v1.1 initialization — bug fix milestone*
