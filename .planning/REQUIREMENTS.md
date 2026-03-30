# Requirements: RPS Challenge (가위바위보 챌린지)

**Defined:** 2026-03-30
**Core Value:** "한 판 더" 도전하고 싶은 긴장감 있는 게임 경험 — 참여자가 끝까지 이기면 보상을 받는 구조.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Game Core

- [x] **GAME-01**: 참여자가 가위/바위/보 중 하나를 탭하여 선택할 수 있다
- [x] **GAME-02**: AI가 판수별 승률에 따라 가위/바위/보를 선택한다 (1판 85%, 2판 75%, 3판 65%, 4판 55%, 5판 30%)
- [x] **GAME-03**: 참여자와 AI의 선택을 이미지로 동시에 공개한다
- [x] **GAME-04**: 승/패/무승부 결과를 명확하게 표시한다
- [x] **GAME-05**: 현재 라운드 번호와 전체 진행 상황을 표시한다
- [x] **GAME-06**: 이기면 다음 판으로 진행하고, 지면 즉시 게임오버 된다
- [x] **GAME-07**: 무승부 시 같은 라운드를 다시 진행한다
- [x] **GAME-08**: 게임오버/승리 화면에서 다시 하기 버튼으로 재시작할 수 있다

### Effects

- [x] **FX-01**: 5판 모두 승리 시 폭죽(confetti) 이펙트가 재생된다
- [x] **FX-02**: 패배 시 아쉬움 이펙트(흔들림 + 탈색)가 재생된다
- [x] **FX-03**: AI 선택 공개 전 1~2초 긴장감 서스펜스 애니메이션이 재생된다
- [x] **FX-04**: 선택 결과 등장 시 공개 애니메이션(0.3~0.6s)이 재생된다

### Integration

- [ ] **INTG-01**: 5판 승리 시 쿠폰 코드/이미지를 표시하는 승리 화면이 나온다
- [x] **INTG-02**: 승리 시 postMessage로 부모 창에 이벤트를 발행한다
- [x] **INTG-03**: iframe으로 외부 서비스에 임베드할 수 있다 (CSS containment, X-Frame-Options)

### UI/UX

- [x] **UI-01**: 모바일 우선 반응형 레이아웃 (최소 터치 타겟 44px)
- [x] **UI-02**: 생동감 있는 게임 스타일 UI (색감, 애니메이션, 게임 느낌)
- [x] **UI-03**: 3초 이내 초기 로드

## v1.1 Requirements (Bug Fixes)

### Effects Fix
- [ ] **BFIX-01**: 5라운드 전승 시 폭죽(confetti) 이펙트가 화면에 실제로 표시된다
- [ ] **BFIX-02**: 패배 시 아쉬움(shake/desaturate) 이펙트가 화면에 실제로 표시된다

### Layout Fix
- [ ] **BFIX-03**: 모바일 브라우저에서 가위바위보 선택 버튼이 주소창에 가려지지 않고 항상 탭 가능하다

### Animation Fix
- [ ] **BFIX-04**: AI 카드 플립 회전 중에는 결과가 보이지 않고, 회전 완료 시에만 AI 선택이 노출된다

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social

- **SOCL-01**: SNS 공유 기능 (KakaoTalk, Instagram 등)
- **SOCL-02**: 결과 화면 캡처/공유

### Sound

- **SND-01**: 선택/공개/승리/패배 효과음 (기본 음소거, 토글)
- **SND-02**: 햅틱 피드백 (Vibration API 지원 기기)

### Analytics

- **ANLY-01**: 라운드별 승률 통계 수집
- **ANLY-02**: 이탈률/완주율 추적

## Out of Scope

| Feature | Reason |
|---------|--------|
| 멀티플레이어 (PvP) | WebSocket 인프라 필요, 이벤트 게임에 과도한 복잡성 |
| 서버사이드 승률 검증 | 쿠폰 검증은 외부 시스템 담당, 게임에 서버 로직 불필요 |
| 리더보드/랭킹 | 인증/DB/개인정보 필요, v1 범위 초과 |
| 튜토리얼 화면 | 가위바위보 규칙은 보편적, 불필요한 마찰 |
| 배경 음악 | iframe 내 자동재생 정책 충돌, 임베드 환경에 부적합 |
| 게임 히스토리/리플레이 | 단발성 프로모션 게임, 세션 기록 불필요 |
| 되돌리기(Undo) | 긴장감 구조 파괴 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GAME-01 | Phase 1 | Complete |
| GAME-02 | Phase 1 | Complete |
| GAME-03 | Phase 1 | Complete |
| GAME-04 | Phase 1 | Complete |
| GAME-05 | Phase 1 | Complete |
| GAME-06 | Phase 1 | Complete |
| GAME-07 | Phase 1 | Complete |
| GAME-08 | Phase 1 | Complete |
| FX-01 | Phase 2 | Complete |
| FX-02 | Phase 2 | Complete |
| FX-03 | Phase 2 | Complete |
| FX-04 | Phase 2 | Complete |
| INTG-01 | Phase 3 | Pending |
| INTG-02 | Phase 3 | Complete |
| INTG-03 | Phase 3 | Complete |
| UI-01 | Phase 2 | Complete |
| UI-02 | Phase 2 | Complete |
| UI-03 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-31 after v1.1 milestone requirements added*
