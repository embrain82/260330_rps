# Phase 4: Bug Fixes - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

v1.0 게임의 버그 3건(이펙트 4건) 수정. 이펙트 트리거 타이밍, 모바일 뷰포트 레이아웃, AI 카드 플립 backface-visibility. 새 기능 추가 없이 기존 의도대로 동작하도록 수정.

</domain>

<decisions>
## Implementation Decisions

### 이펙트 타이밍 (BFIX-01, BFIX-02)
- **D-01:** VictoryConfetti와 DefeatEffect가 AnimatePresence mode="wait" 내부에서 마운트될 때 타이밍 문제로 실행되지 않음. 마운트 후 충분한 딜레이를 두거나 AnimatePresence 진입 애니메이션 완료 후 실행하도록 수정.
- **D-02:** canvas-confetti `useWorker: true` 옵션 유지. confetti 호출 전 DOM이 settle된 상태를 보장해야 함.
- **D-03:** DefeatEffect의 `useAnimate` scope가 AnimatePresence 전환 중에 유효하지 않을 수 있음. 전환 완료 후 animate 호출을 보장.

### 모바일 뷰포트 (BFIX-03)
- **D-04:** `min-h-screen` → `min-h-dvh`로 변경. dynamic viewport height를 사용하여 모바일 주소창 표시/숨김에 따라 동적 조정.
- **D-05:** fixed bottom bar는 유지하되, 컨테이너가 `min-h-dvh`를 사용하도록 수정.
- **D-06:** PlayScreen.tsx:90의 충돌하는 `pb-` 클래스(pb-[env(safe-area-inset-bottom)]와 pb-4) 정리.
- **D-07:** Game.tsx의 최상위 컨테이너도 `min-h-screen` → `min-h-dvh`로 통일.

### AI 카드 플립 애니메이션 (BFIX-04)
- **D-08:** SuspenseReveal을 양면 카드 구조로 변경. `transformStyle: 'preserve-3d'`와 `backfaceVisibility: 'hidden'` 적용.
- **D-09:** 카드 뒷면에 가위+바위+보 3개 아이콘을 작게 함께 표시. 회전 중에는 3개 아이콘이 보이고, 회전 완료 후 실제 AI 선택 1개만 노출.
- **D-10:** 기존 ChoiceCard 컴포넌트의 양면 카드 패턴(backfaceVisibility hidden, rotateY 180deg)을 참조하여 SuspenseReveal에 적용.

### Claude's Discretion
- 이펙트 딜레이 정확한 ms 값 (AnimatePresence 진입 완료 후 적절한 시점)
- dvh fallback 전략 (dvh 미지원 브라우저 대응 여부)
- SuspenseReveal 뒷면 3개 아이콘의 정확한 크기/배치

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 2 Context (원래 의도)
- `.planning/phases/02-ui-effects/02-CONTEXT.md` — D-08(서스펜스 애니메이션), D-09(confetti), D-10(패배 이펙트) 원래 설계 의도

### 기존 코드 (수정 대상)
- `src/components/effects/Confetti.tsx` — VictoryConfetti 컴포넌트 (BFIX-01)
- `src/components/effects/DefeatEffect.tsx` — DefeatEffect 컴포넌트 (BFIX-02)
- `src/components/screens/PlayScreen.tsx` — 모바일 레이아웃 + 하단 버튼바 (BFIX-03)
- `src/components/battle/SuspenseReveal.tsx` — AI 카드 플립 애니메이션 (BFIX-04)
- `src/components/Game.tsx` — AnimatePresence 래퍼, 이펙트 마운트 포인트

### 참조 코드 (양면 카드 패턴)
- `src/components/battle/ChoiceCard.tsx` — 양면 카드 구조 참조 (backfaceVisibility, preserve-3d)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ChoiceCard.tsx`: 양면 카드 구조 (front/back face, backfaceVisibility, preserve-3d) — SuspenseReveal 수정 시 패턴 참조
- `RockIcon`, `PaperIcon`, `ScissorsIcon` SVG 컴포넌트 — 카드 뒷면 3개 아이콘에 재사용
- `canvas-confetti` 라이브러리 설치 완료 — 코드 로직은 정상, 타이밍만 수정

### Established Patterns
- motion v12 `useAnimate` 훅: DefeatEffect와 SuspenseReveal에서 사용 중
- AnimatePresence mode="wait": Game.tsx에서 화면 전환 관리
- Zustand store: `useGameStore`로 phase 상태 관리

### Integration Points
- Game.tsx:46의 최상위 div `min-h-screen` → dvh 변경 필요
- PlayScreen.tsx:57의 wrapper div `min-h-screen` → dvh 변경 필요
- PlayScreen.tsx:90의 fixed bottom bar에서 중복 pb 클래스 정리 필요

</code_context>

<specifics>
## Specific Ideas

- 카드 뒷면: 가위+바위+보 3개 아이콘을 작게 함께 배치 (선택 전 미스터리/랜덤성 표현)
- dvh 사용으로 모바일 주소창 동적 대응

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-bug-fixes*
*Context gathered: 2026-03-31*
