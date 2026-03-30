# Phase 1: Game Logic - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

순수 TypeScript로 가위바위보 게임의 핵심 로직을 구현한다. AI 엔진(판수별 승률 기반 선택), 게임 규칙(승/패/무승부 판정), FSM(상태 전이), 세션 관리(UUID, 라운드 기록). UI 없이 독립적으로 테스트 가능한 순수 함수 레이어.

</domain>

<decisions>
## Implementation Decisions

### 무승부 처리
- **D-01:** 무승부 시 같은 라운드를 반복한다 (라운드 카운터 증가 없음)
- **D-02:** 무승부마다 해당 라운드의 승률이 +5% 상승한다 (예: 2판 75% → 무승부 → 80% → 무승부 → 85%)
- **D-03:** 3회 연속 무승부 시 해당 라운드 자동 승리 처리한다

### 승률 계산 방식
- **D-04:** "85% 승률" = AI가 85% 확률로 사용자에게 지는 선택을 한다. 나머지 15%는 완전 랜덤 (승리 또는 무승부)
- **D-05:** 승률 커브: 1판 85%, 2판 75%, 3판 65%, 4판 55%, 5판 30%
- **D-06:** Math.random() 사용, 시드 고정 없음. 매 게임 완전 랜덤
- **D-07:** 승률은 사용자가 "이길" 확률이 아니라 AI가 "질" 확률이다

### 세션 UUID 계약
- **D-08:** postMessage 승리 이벤트에 포함될 데이터:
  - `sessionId`: UUID v4
  - `rounds`: 각 라운드의 { playerChoice, aiChoice, result, drawCount } 배열
  - `startedAt`: 게임 시작 ISO 타임스탬프
  - `completedAt`: 게임 종료 ISO 타임스탬프
  - `totalPlayTimeMs`: 총 플레이 시간 (밀리초)
- **D-09:** postMessage origin 검증은 환경변수로 설정. 기본값 '*' (나중에 제한)

### 게임 플로우 상태
- **D-10:** FSM 상태: `idle` → `selecting` → `revealing` → `result` → (`gameover` | `victory`)
- **D-11:** `idle` 상태에서 시작 화면 표시 — "5판 연속 승리하면 쿠폰!" 규칙 설명 + 시작 버튼
- **D-12:** `result` 상태에서 승리 시 다음 라운드의 `selecting`으로, 패배 시 `gameover`로, 5판 승리 시 `victory`로 전이

### Claude's Discretion
- FSM 구현 방식 (useReducer vs Zustand vs 순수 함수) — 리서치/플래닝에서 결정
- 타입 정의 구조 (단일 파일 vs 분리)
- 테스트 전략 (유닛 테스트 범위)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — 프로젝트 비전, 제약사항, 핵심 가치
- `.planning/REQUIREMENTS.md` — GAME-01~08 요구사항 상세

### Research
- `.planning/research/ARCHITECTURE.md` — FSM 패턴, useReducer 권장, 순수 함수 분리 구조
- `.planning/research/STACK.md` — Zustand v5, TypeScript 설정
- `.planning/research/PITFALLS.md` — 클라이언트 확률 조작 리스크, 세션 UUID 멱등성

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 없음 (greenfield 프로젝트)

### Established Patterns
- 없음 — Phase 1에서 패턴 수립

### Integration Points
- Phase 2에서 이 로직 레이어의 타입과 함수를 import하여 UI 구현
- Phase 3에서 세션 데이터를 postMessage로 전달

</code_context>

<specifics>
## Specific Ideas

- 승률 테이블은 상수로 정의하여 쉽게 수정 가능하게
- 무승부 보너스(+5%)도 설정 가능한 상수로
- 3회 연속 무승부 자동 승리도 설정 가능한 상수로

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-game-logic*
*Context gathered: 2026-03-30*
