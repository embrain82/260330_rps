# Phase 4: Bug Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 04-bug-fixes
**Areas discussed:** 카드 뒷면 디자인, 모바일 레이아웃

---

## 카드 뒷면 디자인

| Option | Description | Selected |
|--------|-------------|----------|
| ? 물음표 | 기존 ChoiceCard의 뒷면 패턴과 동일하게 유지 | |
| 빈 카드 | 아이콘 없이 하얀 카드만 표시 | |
| 가위바위보 3개 아이콘 | 뒷면에 가위+바위+보 아이콘을 작게 함께 표시 | ✓ |

**User's choice:** 가위바위보 3개 아이콘
**Notes:** 회전 중에는 3개 아이콘이 보이다가 회전 완료 시 실제 AI 선택 하나만 노출

---

## 모바일 레이아웃

| Option | Description | Selected |
|--------|-------------|----------|
| dvh 적용 | min-h-screen → min-h-dvh로 변경, fixed 버튼바 유지 | ✓ |
| fixed 제거 | flexbox 기반으로 변경, 스크롤 없는 단일 화면 | |
| safe-area 보정 | fixed 유지하되 bottom padding 충분히 확보 | |

**User's choice:** dvh 적용 (Recommended)
**Notes:** dynamic viewport height로 주소창 동적 대응

---

## Claude's Discretion

- 이펙트 딜레이 정확한 ms 값
- dvh fallback 전략
- 카드 뒷면 3개 아이콘 크기/배치
