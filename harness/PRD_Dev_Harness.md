# PRD: Harness — Dev Workflow Tool

version: v2.0
작성일: 2026-04-01
수정일: 2026-04-04
상태: 진행 중

---

## Why

AI 코드 생성 환경에서 개발 산출물(회의록, CPS, PRD, 스펙, 아키텍처, 태스크, 리뷰, PR)이
파일로 남지 않거나 흩어져 관리되지 않는 문제가 있다.

기존 AI Pipeline Auditor 방식은 전 단계를 AI가 자율 실행하는 구조였으나,
사람의 개입과 판단이 자연스럽게 녹아들기 어려웠다.

---

## 핵심 패러다임

**AI가 일하고, 사람이 검증한다.**

1. **AI 주도 실행** — AI가 각 단계의 문서를 생성하고 워크플로우를 진행한다
2. **사람은 승인 게이트** — 검토, 피드백, 승인/거절로만 개입한다
3. **AI 자기 수정 + 성장** — 피드백을 받으면 스스로 수정하고 학습한다
4. **AI 오케스트레이션** — AI가 여러 작업을 조율/관리하는 역할도 수행할 수 있다

---

## Goal

- `.harness/` 폴더 구조와 MD 파일로 개발 전 과정을 파일 기반으로 관리한다
- Plan → Design → Build → Deliver 4단계 흐름을 제공한다
- AI가 주도하고 사람이 승인하는 워크플로우를 구현한다
- 모든 단계의 산출물이 파일로 남아 추적 가능한 상태를 유지한다
- current.md = 항상 최신 승인본, 폴더 구조 = 상태 (별도 메타데이터 불필요)

---

## Non-goals

- 브라우저 기반 웹 UI (터미널 TUI로 전환 완료)
- 특정 언어 / 프레임워크에 종속된 구현
- 외부 서비스 연동 (Jira, Notion 등)

---

## 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| **UI** | Ink (React for Terminal) | 터미널에서 React 컴포넌트 렌더링, 3컬럼 레이아웃 |
| **AI** | Claude Agent SDK | OAuth 인증(Team 구독), 세션 유지, 서브에이전트, 도구 사용 |
| **파일 시스템** | Node.js fs/promises | 로컬 `.harness/` 폴더 직접 접근 |
| **언어** | TypeScript | 타입 안전성 |

### 기술 결정 이력

| 날짜 | 결정 | 이유 |
|------|------|------|
| 2026-04-04 | 브라우저 → 터미널 TUI 전환 | API 크레딧 불필요(Team OAuth), Agent SDK 풀 기능 사용 가능, 배포 심플 |
| 2026-04-04 | Anthropic SDK → Claude Agent SDK | 세션 유지, 서브에이전트, OAuth 인증 지원 |
| 2026-04-04 | File System Access API → Node.js fs | 브라우저 의존 제거, 크로스 플랫폼 |

---

## User Scenario

개발자가 새 기능을 개발할 때:

1. `npx tsx src/app.tsx .` 로 Harness 실행
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **AI에게 meeting 문서 작성 요청** → AI가 초안 생성
4. 문서 패널에서 검토 → **[y] 승인** 또는 **[n] 거절** + 피드백
5. 승인 시 current.md 저장 + 이전 내용은 YYYY-MM-DD.md로 아카이브
6. 다음 단계(cps → prd → spec → ...)로 자동 진행

### 플로우

```
meeting → cps → prd → spec → architecture → tasks → (코딩) → self-review → pr
   AI 생성  →  사람 승인  →  AI 생성  →  사람 승인  →  ...
```

---

## 터미널 UI 레이아웃

```
┌─ Harness ─────────────────────────────────────────────┐
│ [Plan ■] [Design □] [Build □] [Deliver □]             │
├────────────┬──────────────────────┬───────────────────┤
│ meeting ✓  │ AI Chat              │ Document          │
│ cps ✓      │                      │ # PRD — my-app    │
│ prd ○ ←    │ AI: PRD 초안을       │ ## 목표            │
│            │ 생성했습니다.          │ - 인증 시스템 구현  │
│            │                      │ ...               │
│            │ > 입력...            │                   │
│            │                      │ [y]승인 [n]거절    │
└────────────┴──────────────────────┴───────────────────┘
```

- **왼쪽**: 폴더/파일 사이드바 (↑↓ 선택)
- **중앙**: AI 채팅 (메인 인터페이스)
- **오른쪽**: 문서 미리보기 + 승인/거절

---

## Functional Requirements

### 폴더 구조

```
.harness/<project-name>/
  meeting/
    current.md          ← 최신 승인본 (편집 가능)
    2026-04-01.md       ← 히스토리 (읽기 전용, 불변)
  cps/
    current.md
  prd/
    current.md
  spec/
    current.md
  architecture/
    current.md
  tasks/
    task-001.md         ← 순차 파일
    task-002.md
  self-review/
    current.md
  pr/
    pr-001.md           ← 순차 파일
```

### 각 단계별 문서

| 단계 | 폴더 | 목적 |
|------|------|------|
| Plan | meeting/ | 회의 요약 / 결정 사항 / 액션 아이템 기록 |
| Plan | cps/ | Context / Problem / Solution 구조화 |
| Plan | prd/ | 요건 정의 (Why / Goal / 기능 요건 / 인수 기준) |
| Design | spec/ | 기능 상세 스펙 (Input/Output / 규칙 / 엣지 케이스) |
| Design | architecture/ | 구현 전략 (영향 범위 / 데이터 흐름 / 핵심 결정) |
| Design | tasks/ | 태스크 분해 (완료 기준 / 검증 방법 포함) |
| Build | self-review/ | 요건 충족 / 코드 품질 / 리스크 / 테스트 체크리스트 |
| Deliver | pr/ | PR 초안 (Summary / Why / 변경 내용 / 추적성) |

### current.md 업데이트 규칙

1. 승인 시 현재 current.md → YYYY-MM-DD.md로 히스토리 보관
2. current.md를 새 내용으로 덮어쓰기
3. 히스토리 파일은 절대 수정하지 않음 (불변)

### 핵심 규칙

1. **AI가 문서를 생성한다** — 사람이 직접 쓰는 것은 meeting 기록뿐
2. **사람은 승인 게이트에서만 개입** — 검토, 피드백, 승인/거절
3. **current.md = 현재 진실** — 항상 최신 승인본
4. **폴더 구조 = 상태** — 별도 메타데이터 불필요
5. PRD에 측정 가능한 목표가 있어야 Design 진입 가능

---

## Constraints

- 외부 도구 없이 Markdown 파일과 터미널만으로 동작해야 한다
- Claude Code OAuth 인증을 재사용하여 별도 API 키 설정 불필요
- `npx tsx src/app.tsx .` 한 줄로 실행 가능해야 한다

---

## Acceptance Criteria

- [x] `.harness/` 폴더 구조와 각 파일의 목적이 문서화되어 있다
- [x] 터미널 TUI에서 3컬럼 레이아웃(사이드바 | AI 채팅 | 문서 패널)이 동작한다
- [x] AI 채팅에서 문서 생성 요청 → `<document>` 태그 추출 → 문서 패널 미리보기
- [x] 문서 승인(y) → current.md 저장 + 아카이브, 거절(n) → 클리어
- [x] Claude Agent SDK OAuth 인증으로 API 키 없이 동작
- [ ] 빈 폴더 진입 시 current.md 자동 생성 + AI 초안 제안
- [ ] tasks/pr 순차 파일 생성
- [ ] Phase 진행 가이드 (다음 단계 자동 제안)
- [ ] 서브에이전트 오케스트레이션 (병렬 문서 생성/리뷰)

---

## 미래 방향

- **AI 오케스트레이션**: 서브에이전트가 병렬로 문서 생성, 리뷰, 검증 수행
- **AI 학습/성장**: 피드백 패턴을 기반으로 문서 품질 자동 개선
- **retro.md**: 프로젝트 회고 문서 자동 생성

---

## Risks

- 템플릿 과도한 세분화: 팀에 따라 일부 파일은 생략 가능하도록 유연성 확보 필요
- Agent SDK OAuth 정책 변경: Anthropic 정책에 따라 인증 방식 조정 필요할 수 있음
- 터미널 제약: 긴 문서 표시, 마크다운 렌더링 등 TUI 한계 존재

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-01 | v1.0 초안 작성 (AI Pipeline Auditor PRD 대체) |
| 2026-04-04 | v2.0 핵심 패러다임 변경 ("사람 주도 + AI 보조" → "AI 주도 + 사람 승인") |
| 2026-04-04 | 브라우저 React → 터미널 TUI (Ink) 전환 |
| 2026-04-04 | Anthropic SDK → Claude Agent SDK (OAuth, 세션, 서브에이전트) |
| 2026-04-04 | 3컬럼 레이아웃: Sidebar \| AI Chat (메인) \| Document Panel |
