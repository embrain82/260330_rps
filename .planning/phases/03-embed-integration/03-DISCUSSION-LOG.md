# Phase 3: Embed & Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 03-embed-integration
**Areas discussed:** 쿠폰 승리 화면, postMessage 계약, iframe 임베드 설정

---

## 쿠폰 승리 화면

### 쿠폰 데이터 소스

| Option | Description | Selected |
|--------|-------------|----------|
| 부모 창에서 전달 | iframe 로드 시 부모 페이지가 postMessage로 쿠폰 정보 전달 | ✓ |
| URL 파라미터로 전달 | iframe src에 ?coupon=CODE&image=URL 파라미터 추가 | |
| 하드코딩/환경변수 | 쿠폰 코드를 환경변수로 고정 | |

**User's choice:** 부모 창에서 전달
**Notes:** 호스트 앱 의존성 없이 유연한 구조

### 쿠폰 UI 구성

**User's choice:** Claude's Discretion — 전달된 데이터에 따라 유연하게 렌더링
**Notes:** 없음

### 쿠폰 없을 때 Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| 축하 메시지만 | 쿠폰 영역 숨기고 축하 메시지만 표시 | ✓ |
| 기본 쿠폰 표시 | 하드코딩된 기본 쿠폰 텍스트 표시 | |

**User's choice:** 축하 메시지만
**Notes:** 쿠폰 없이도 게임 정상 동작

---

## postMessage 계약

### 이벤트 타이밍

| Option | Description | Selected |
|--------|-------------|----------|
| victory 진입 즉시 | FSM이 victory로 전이하는 순간 발행 | ✓ |
| 쿠폰 확인 후 | 사용자가 쿠폰을 확인한 뒤 발행 | |
| You decide | Claude가 결정 | |

**User's choice:** victory 진입 즉시
**Notes:** 부모 창이 즉시 반응 가능

### 이벤트 데이터 범위

| Option | Description | Selected |
|--------|-------------|----------|
| 세션 데이터만 | Phase 1 D-08 SessionPayload만 포함 | ✓ |
| 쿠폰 데이터도 포함 | 수신한 쿠폰 정보를 승리 이벤트에 포함 | |

**User's choice:** 세션 데이터만
**Notes:** 쿠폰 데이터는 부모 창이 이미 알고 있으므로 중복 전송 불필요

---

## iframe 임베드 설정

### 테스트 페이지

| Option | Description | Selected |
|--------|-------------|----------|
| 테스트 페이지 생성 | public/test-embed.html에 iframe + postMessage 로그 | ✓ |
| 테스트 페이지 없이 | 수동 테스트로 검증 | |

**User's choice:** 테스트 페이지 생성
**Notes:** 개발/QA용. iframe 임베드 + 쿠폰 전달 + 이벤트 수신 확인

### iframe 허용 도메인

| Option | Description | Selected |
|--------|-------------|----------|
| 모든 도메인 허용 | X-Frame-Options 제거, CSP frame-ancestors '*' | ✓ |
| 환경변수로 제한 | ALLOWED_ORIGINS 환경변수로 허용 도메인 설정 | |

**User's choice:** 모든 도메인 허용
**Notes:** 이벤트/프로모션용이므로 제한 없이 임베드 가능. 필요 시 프로덕션에서 제한.

---

## Claude's Discretion

- 쿠폰 UI 레이아웃 세부 구성
- CSS containment 구현 방식
- next.config.ts 헤더 설정 세부 구조
- postMessage 리스너 구현 위치

## Deferred Ideas

None — discussion stayed within phase scope
