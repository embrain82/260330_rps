# Phase 2: UI & Effects - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

가위바위보 게임을 브라우저에서 완전히 플레이 가능한 UI로 구현한다. 5개 FSM 상태(idle, selecting, revealing, result, gameover/victory)에 대응하는 화면 렌더링, 선택/공개/결과 애니메이션, 승리/패배 이펙트, 모바일 우선 반응형 레이아웃. Phase 1의 순수 함수 레이어를 import하여 UI와 연결한다.

</domain>

<decisions>
## Implementation Decisions

### 게임 비주얼 스타일
- **D-01:** 가위/바위/보 표현은 커스텀 SVG 일러스트로 구현한다. 카툰 스타일 — 둥글둥글한 라인, 과장된 비율, 두꺼운 웅큼한 외곽선. 캐릭터 느낌의 손 모양.
- **D-02:** 전체 톤은 밝고 탕탕한 아케이드 스타일. 선명한 색상(coral red, teal, yellow 계열), 큰 아이콘, 둥근 모서리, 큰 그림자, 탄성 있는 애니메이션.
- **D-03:** 배경은 라운드별 변화 — 1판 차분한 블루 → 2판 틸 → 3판 따뜻한 옐로우 → 4판 오렌지 → 5판 강렬한 레드. 긴장감 상승을 배경색 그라디언트로 시각화.

### 화면 구성 & 레이아웃
- **D-04:** 시작 화면(idle)은 미니멀 — "5판 연속 승리하면 쿠폰!" 한 줄 규칙 설명 + 큰 시작하기 버튼. 승률 커브 미표시.
- **D-05:** 가위/바위/보 선택 버튼은 화면 하단 고정 3열 배치. 위쪽에 라운드 정보 + 대결 영역(Player vs AI). 모바일 엄지 닿기 쉬운 bottom bar 패턴.
- **D-06:** 라운드 진행 상황은 스텝 돈(●○○○○) 형태로 표시. 승리한 라운드는 채워지고, 현재 라운드는 구분, 남은 라운드는 비어있음.
- **D-07:** 결과 화면(victory/gameover)은 전체 화면 전환. 게임 화면이 완전히 바뀌며 큰 메시지 + 이펙트 + 다시하기 버튼.

### 애니메이션 & 이펙트 연출
- **D-08:** 서스펜스 애니메이션(FX-03)은 카드 셔플 스타일. AI 카드가 빠르게 뒤집히다 감속하며 멈추고 공개. ~1.5초 동안 진행.
- **D-09:** 승리 confetti(FX-01)는 대형 폭죽. canvas-confetti로 화면 전체를 채우는 다중 폭발(중앙, 좌, 우 시차 발사). 3-4초 지속.
- **D-10:** 패배 이펙트(FX-02)는 화면 흔들림(0.3초) + 탈색(컬러→그레이스케일 0.5초) + 관 깨지는 크랙 이펙트(선택적). 약 1초간 극적 연출.

### 게임 플로우 & 인터랙션
- **D-11:** 빠른 템포 — 선택 후 서스펜스 1초 → 공개 0.3초 → 결과 표시 1초 → 자동 다음 라운드. 전체 약 2.5초/라운드. "다음" 버튼 없이 자동 전환.
- **D-12:** 라운드 결과(승/패)는 큰 텍스트("승리!" / "패배...")로 표시 + 배경 색상 플래시(승=초록, 패=빨간).
- **D-13:** 무승부는 "무승부! 다시!" 텍스트(노란색) 표시 후 0.8초 뒤 자동으로 같은 라운드 선택 화면으로 전환.

### Claude's Discretion
- Zustand store 구조 및 selector 설계 — 리서치/플래닝에서 결정
- 컴포넌트 분리 구조 (GameBoard, ChoiceButton, ResultScreen 등 명명/분리)
- SVG 손 아이콘 세부 디자인 — 카툰 스타일 범위 내에서 자유
- motion v12 애니메이션 variants 설계 — 위 타이밍 범위 내에서 자유
- 크랙 이펙트 구현 여부 및 방식

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — 프로젝트 비전, 제약사항, 핵심 가치 ("한 판 더" 긴장감)
- `.planning/REQUIREMENTS.md` — FX-01~04, UI-01~03 요구사항 상세
- `CLAUDE.md` — 기술 스택 결정 (motion v12, canvas-confetti, Zustand v5, Tailwind v4)

### Phase 1 Context & Code
- `.planning/phases/01-game-logic/01-CONTEXT.md` — Phase 1 결정사항 (FSM 상태, 승률 설계, 세션 계약)
- `src/lib/rps/types.ts` — Choice, Outcome, Phase, GameState, GameAction 타입 정의
- `src/lib/rps/constants.ts` — WIN_RATE_TABLE, DRAW_BONUS_PCT, MAX_DRAW_AUTO_WIN, TOTAL_ROUNDS
- `src/lib/rps/gameRules.ts` — determineOutcome 순수 함수
- `src/lib/rps/aiEngine.ts` — pickAiChoice AI 엔진
- `src/lib/rps/session.ts` — createSession, finalizeSession
- `src/lib/rps/index.ts` — barrel export

### Research
- `.planning/research/ARCHITECTURE.md` — FSM 패턴, 순수 함수 분리 구조
- `.planning/research/STACK.md` — Zustand v5, motion v12 설정
- `.planning/research/PITFALLS.md` — 클라이언트 확률 조작 리스크

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/rps/` — 완전한 게임 로직 레이어. GameState, GameAction 타입으로 useReducer 또는 Zustand에서 직접 사용 가능.
- `src/lib/rps/types.ts:Phase` — FSM 상태 타입이 이미 정의됨 (idle, selecting, revealing, result, gameover, victory). UI 컴포넌트에서 Phase 타입으로 화면 전환 분기.
- Tailwind v4 + Geist 폰트 — globals.css에 이미 설정 완료.

### Established Patterns
- Phase 1에서 순수 함수 패턴 확립 — UI는 이 함수들을 호출만 하면 됨.
- barrel export (`src/lib/rps/index.ts`) — `import { GameState, pickAiChoice, ... } from '@/lib/rps'`로 import.

### Integration Points
- `src/app/page.tsx` — 현재 Next.js boilerplate. 게임 화면으로 교체 대상.
- `src/app/globals.css` — 배경색/테마 변수 추가 필요 (라운드별 배경 변화).
- 새 디렉토리: `src/components/` — 게임 컴포넌트 생성 필요.
- 새 디렉토리: `src/assets/svg/` 또는 인라인 SVG 컴포넌트 — 손 아이콘.

</code_context>

<specifics>
## Specific Ideas

- 라운드별 배경 변화: calm blue → teal → warm yellow → orange → intense red (5단계 긴장감 커브)
- SVG 손 아이콘은 카툰 글러브 스타일 (미키마우스 손 느낌) — 둥글둥글, 과장된 비율, 두꺼운 외곽선
- 서스펜스 셔플 애니메이션: 3장이 빠르게 → 2장 → 1장으로 감속하며 공개
- 승리 confetti는 여러 방향에서 시차 발사 (중앙 → 좌 → 우)
- 전체 게임 흐름은 "다음" 버튼 없이 자동 전환으로 아케이드 템포 유지

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-ui-effects*
*Context gathered: 2026-03-30*
