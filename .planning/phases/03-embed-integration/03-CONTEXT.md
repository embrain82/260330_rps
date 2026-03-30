# Phase 3: Embed & Integration - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

게임을 iframe으로 외부 서비스에 임베드 가능하게 하고, 5판 승리 시 쿠폰 화면을 표시하며, postMessage로 부모 창에 승리 이벤트를 발행한다. 쿠폰 데이터는 부모 창에서 전달받고, 게임은 세션 데이터만 부모에게 보낸다.

</domain>

<decisions>
## Implementation Decisions

### 쿠폰 승리 화면
- **D-01:** 쿠폰 데이터는 부모 창에서 postMessage(`RPS_COUPON_CONFIG`)로 전달받는다. 게임은 수신 후 저장, 승리 시 표시만 함.
- **D-02:** 쿠폰 데이터 구조: `{ type: 'RPS_COUPON_CONFIG', couponCode: string, couponImage?: string, couponText?: string }`
- **D-03:** 쿠폰 데이터가 없을 때 (부모 창이 전달 안 했을 때) — 축하 메시지만 표시하고 쿠폰 영역 숨김. 게임은 쿠폰 없이도 정상 동작.

### 쿠폰 UI
- **D-04:** Claude's Discretion — 쿠폰 화면 구성 (코드 + 이미지 + 텍스트, 코드만, 등). 부모 창에서 전달된 데이터에 따라 유연하게 렌더링.

### postMessage 계약
- **D-05:** 승리 이벤트는 victory 상태 진입 즉시 발행. 쿠폰 화면 렌더링과 동시에 부모 창이 이벤트를 받음.
- **D-06:** postMessage 이벤트 타입: `RPS_GAME_WIN`. 페이로드는 Phase 1에서 정의한 SessionPayload만 포함 (D-08). 쿠폰 데이터는 미포함 (부모 창이 이미 알고 있음).
- **D-07:** postMessage 데이터 구조:
  ```
  {
    type: 'RPS_GAME_WIN',
    payload: {
      sessionId: string (UUID v4),
      rounds: RoundRecord[],
      startedAt: string (ISO),
      completedAt: string (ISO),
      totalPlayTimeMs: number
    }
  }
  ```
- **D-08:** postMessage origin 검증은 환경변수로 설정. 기본값 '*' (Phase 1 D-09 유지). `NEXT_PUBLIC_ALLOWED_ORIGIN` 환경변수.

### iframe 임베드 설정
- **D-09:** 모든 도메인에서 iframe 임베드 허용. X-Frame-Options 헤더 제거, CSP frame-ancestors '*'. 프로덕션에서 필요 시 환경변수로 제한 가능.
- **D-10:** CSS containment 적용 — 게임 스타일이 부모 페이지로 누출되지 않도록 격리.
- **D-11:** 테스트 페이지(`public/test-embed.html`) 생성. iframe으로 게임 임베드 + 쿠폰 데이터 전달 + postMessage 수신 로그 표시. 개발/QA용.

### Claude's Discretion
- 쿠폰 UI 레이아웃 세부 구성 — 전달받은 데이터에 따라 유연하게 렌더링
- CSS containment 구현 방식 (contain 속성, scoped styles 등)
- next.config.ts 헤더 설정 세부 구조
- postMessage 리스너 구현 위치 (Game.tsx, store, 또는 별도 hook)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — 프로젝트 비전, 제약사항
- `.planning/REQUIREMENTS.md` — INTG-01, INTG-02, INTG-03 요구사항 상세

### Phase 1 Context (postMessage 계약 원본)
- `.planning/phases/01-game-logic/01-CONTEXT.md` — D-08 (SessionPayload 구조), D-09 (origin 검증)
- `src/lib/rps/types.ts` — SessionPayload, RoundRecord 타입 정의
- `src/lib/rps/session.ts` — createSession, finalizeSession

### Phase 2 Code (수정 대상)
- `src/components/screens/ResultScreen.tsx` — 현재 victory 화면. 쿠폰 UI 추가 대상
- `src/components/Game.tsx` — AnimatePresence 화면 라우팅. postMessage 발행 위치
- `src/store/gameStore.ts` — Zustand FSM 스토어. session 데이터 보관
- `src/app/page.tsx` — dynamic import. iframe 진입점

### Config
- `CLAUDE.md` — 기술 스택 (Next.js 15, Tailwind v4), iframe 임베드 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/rps/types.ts:SessionPayload` — postMessage 페이로드 타입이 이미 정의됨. 그대로 사용.
- `src/store/gameStore.ts` — Zustand 스토어에 `session` 필드가 있음. victory 상태에서 finalizeSession 완료된 세션 데이터 접근 가능.
- `src/components/screens/ResultScreen.tsx` — victory 화면의 기본 구조 존재. "쿠폰을 확인하세요" 텍스트가 이미 있음.

### Established Patterns
- Zustand selector 패턴: `useGameStore((s) => s.field)` — 컴포넌트에서 상태 접근.
- 'use client' 컴포넌트 패턴 — 모든 게임 컴포넌트가 클라이언트 컴포넌트.
- motion/react 애니메이션 — AnimatePresence로 화면 전환.

### Integration Points
- `ResultScreen.tsx` — 쿠폰 UI 추가. 현재 "쿠폰을 확인하세요" 텍스트를 실제 쿠폰 표시로 교체.
- `Game.tsx` — victory 상태 진입 시 postMessage 발행 로직 추가 (useEffect).
- `next.config.ts` — iframe 허용 헤더 설정.
- `public/test-embed.html` — 새 파일. 임베드 테스트 페이지.

</code_context>

<specifics>
## Specific Ideas

- 부모 창 → 게임: `RPS_COUPON_CONFIG` 메시지로 쿠폰 데이터 전달
- 게임 → 부모 창: `RPS_GAME_WIN` 메시지로 세션 데이터 전달
- 양방향 postMessage 통신이지만 각 방향은 단일 메시지 타입만 사용
- 쿠폰 없이도 게임이 완전히 동작해야 함 (graceful fallback)
- test-embed.html에 postMessage 로그를 실시간으로 보여주어 디버깅 편의 제공

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-embed-integration*
*Context gathered: 2026-03-30*
