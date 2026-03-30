# Phase 1: Game Logic - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 01-game-logic
**Areas discussed:** 무승부 처리, 승률 계산 방식, 세션 UUID 계약, 게임 플로우 상태

---

## 무승부 처리

| Option | Description | Selected |
|--------|-------------|----------|
| 무제한 반복 | 나올 때까지 계속 반복. 단순하고 공정함 | |
| 3회 반복 후 자동 승리 | 3번 연속 무승부 시 자동으로 다음 판으로 승리 처리 | ✓ |
| 3회 반복 후 랜덤 판정 | 3번 연속 무승부 시 50:50으로 랜덤 승패 결정 | |

**User's choice:** 3회 반복 후 자동 승리

| Option | Description | Selected |
|--------|-------------|----------|
| 같은 승률 유지 | 2판에서 무승부나면 계속 75% 승률 | |
| 무승부마다 승률 상승 | 무승부 1회당 +5% 승률 보너스 | ✓ |

**User's choice:** 무승부마다 승률 상승 (+5%)

---

## 승률 계산 방식

| Option | Description | Selected |
|--------|-------------|----------|
| AI가 지는 선택을 85%로 | AI가 85% 확률로 사용자에게 지는 선택을 함. 나머지 15%는 랜덤 | ✓ |
| 사용자 승리 확률 85% | 승리 85%, 패배 10%, 무승부 5% 같은 분포 | |
| 승리+무승부 합산 85% | 지지 않을 확률이 85% | |

**User's choice:** AI가 지는 선택을 85%로

| Option | Description | Selected |
|--------|-------------|----------|
| 완전 랜덤 | Math.random() 사용, 매번 다른 결과 | ✓ |
| 세션별 시드 | 세션 UUID로 시드된 PRNG — 동일 세션은 동일 결과 | |

**User's choice:** 완전 랜덤

---

## 세션 UUID 계약

**postMessage 데이터 (multiSelect):**

| Option | Description | Selected |
|--------|-------------|----------|
| 세션 UUID | 멱등성 키로 사용 — 중복 쿠폰 방지 | ✓ |
| 라운드 결과 배열 | 각 판의 선택과 결과 기록 | ✓ |
| 타임스탬프 | 게임 시작/종료 시간 | ✓ |
| 총 플레이 시간 | 게임에 소요된 시간 (초) | ✓ |

**User's choice:** 4개 모두 선택

| Option | Description | Selected |
|--------|-------------|----------|
| 나중에 설정 | 환경변수로 origin allowlist 설정. 지금은 '*' 기본값 | ✓ |
| 하드코딩 | 특정 도메인을 코드에 직접 박음 | |

**User's choice:** 나중에 설정

---

## 게임 플로우 상태

| Option | Description | Selected |
|--------|-------------|----------|
| 기본 상태만 | idle → selecting → revealing → result → (gameover / victory) | ✓ |
| countdown 추가 | 선택 전 3-2-1 카운트다운 상태 추가 | |
| suspense 추가 | revealing 전에 별도 suspense 상태 추가 | |

**User's choice:** 기본 상태만

| Option | Description | Selected |
|--------|-------------|----------|
| 시작 버튼만 | "게임 시작" 버튼 하나만 있는 간단한 화면 | |
| 규칙 설명 + 시작 | "5판 연속 승리하면 쿠폰!" 설명과 시작 버튼 | ✓ |
| 바로 시작 | 시작 화면 없이 바로 1판 진행 | |

**User's choice:** 규칙 설명 + 시작

---

## Claude's Discretion

- FSM 구현 방식 (useReducer vs Zustand vs 순수 함수)
- 타입 정의 구조
- 테스트 전략

## Deferred Ideas

None
