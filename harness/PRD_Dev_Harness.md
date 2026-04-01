# PRD: [Tool Name TBD] — Dev Harness

version: v1.0
작성일: 2026-04-01
상태: 초안

---

## Why

AI 코드 생성 환경에서 개발 산출물(회의록, CPS, PRD, 스펙, 아키텍처, 태스크, 리뷰, PR)이
파일로 남지 않거나 흩어져 관리되지 않는 문제가 있다.

기존 AI Pipeline Auditor 방식은 전 단계를 AI가 자율 실행하는 구조였으나,
사람의 개입과 판단이 자연스럽게 녹아들기 어려웠다.

---

## Goal

- `.harness/` 폴더 구조와 MD 템플릿으로 개발 전 과정을 파일 기반으로 관리한다
- Plan → Design → Build → Deliver 4단계 흐름을 제공한다
- 사람이 주도하고 AI가 각 단계에서 보조하는 협업 워크플로우를 구현한다
- 모든 단계의 산출물이 파일로 남아 추적 가능한 상태를 유지한다

---

## Non-goals

- 완전 자동화된 파이프라인 (AI가 전 단계를 자율 실행하는 구조)
- 특정 언어 / 프레임워크에 종속된 구현
- 외부 서비스 연동 (Jira, Notion 등)

---

## User Scenario

개발자가 새 기능을 개발할 때:

1. `meeting.md` — 회의 내용 기록
2. `cps.md` — 맥락 / 문제 / 솔루션 초안 정리
3. `prd.md` — 요건 문서화
4. `spec.md` — 기능 상세 스펙 작성
5. `architecture.md` — 구현 전략 수립
6. `tasks.md` — 코드 구현 태스크로 분해
7. 코드 구현
8. `self_review.md` — 셀프 리뷰
9. `pr.md` — PR 초안 생성

각 단계에서 사람이 초안을 작성하거나 AI에게 초안 작성을 의뢰하고,
상대방이 검토 / 보완하는 방식으로 협업한다.

---

## Functional Requirements

### 폴더 구조

```
.harness/
  plan/
    meeting.md
    cps.md
    prd.md

  design/
    spec.md
    architecture.md
    tasks.md

  build/
    self_review.md

  deliver/
    pr.md
```

### 각 단계별 템플릿

| 단계 | 파일 | 목적 |
|---|---|---|
| Plan | `meeting.md` | 회의 요약 / 결정 사항 / 액션 아이템 기록 |
| Plan | `cps.md` | Context / Problem / Solution 구조화 |
| Plan | `prd.md` | 요건 정의 (Why / Goal / 기능 요건 / 인수 기준) |
| Design | `spec.md` | 기능 상세 스펙 (Input/Output / 규칙 / 엣지 케이스) |
| Design | `architecture.md` | 구현 전략 (영향 범위 / 데이터 흐름 / 핵심 결정) |
| Design | `tasks.md` | 태스크 분해 (완료 기준 / 검증 방법 포함) |
| Build | `self_review.md` | 요건 충족 / 코드 품질 / 리스크 / 테스트 체크리스트 |
| Deliver | `pr.md` | PR 초안 (Summary / Why / 변경 내용 / 추적성) |

### 핵심 규칙

1. 모든 단계의 산출물은 파일로 남긴다
2. Spec이 기준이다 — Spec 변경 시 Task 재검증 필요
3. Task는 Spec version을 명시한다
4. PR 전에 반드시 self_review.md를 작성한다
5. 각 팀 / 프로젝트에 맞게 템플릿을 커스텀할 수 있다

---

## Constraints

- 외부 도구 없이 Markdown 파일만으로 동작해야 한다
- Claude Code 환경에서 AI 보조가 원활히 가능한 구조여야 한다
- 파일 하나가 하나의 관심사를 담아야 한다 (단일 책임)

---

## Acceptance Criteria

- [ ] `.harness/` 폴더 구조와 각 파일의 목적이 문서화되어 있다
- [ ] 9단계 사용 방법(Usage)이 명확히 기술되어 있다
- [ ] 각 템플릿 파일의 섹션 구성이 정의되어 있다
- [ ] 핵심 규칙 5가지가 명시되어 있다
- [ ] Plan / Design / Build / Deliver 4단계 흐름이 명확하다

---

## Risks

- 툴 이름 미정: 이름 결정 후 파일명 및 내부 표기 업데이트 필요
- 템플릿 과도한 세분화: 팀에 따라 일부 파일은 생략 가능하도록 유연성 확보 필요
- AI 의존도: AI 보조 없이도 사람 단독으로 사용할 수 있는 구조 유지 필요

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-04-01 | 초안 작성 (AI Pipeline Auditor PRD 대체) |
