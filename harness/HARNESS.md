# Harness — AI 실행 가이드

> 이 문서는 AI가 Harness 워크플로우를 이해하고 실행하기 위한 기준 문서다.
> 사람은 검토/승인 역할을 하고, AI가 각 단계의 문서 생성과 실행을 주도한다.

---

## 핵심 패러다임

**AI가 실행한다 → 사람이 검토/승인한다**

- AI는 각 단계의 문서를 자동 생성한다
- 사람은 문서를 검토하고 승인하거나 피드백을 준다
- 피드백은 AI 대화로 전달되고, AI가 문서를 수정한다
- 승인된 문서만 다음 단계로 넘어간다

---

## 폴더 구조

```
.harness/
  {프로젝트-피처}/          ← 프로젝트 또는 피처 단위로 생성
    meeting/
      current.md            ← 항상 최신본 (선택적, 미팅이 있을 때만)
      2026-04-01.md         ← 날짜 기반 히스토리 (업데이트 시 이전본 보관)

    cps/
      current.md            ← Context / Problem / Solution
      2026-04-01.md

    prd/
      current.md            ← 요건 정의. 측정 가능한 목표 확정 시 Design 진입
      2026-04-01.md
      2026-04-10.md

    spec/
      current.md            ← 기능/작업 상세 스펙
      2026-04-05.md

    architecture/
      current.md            ← 구현 전략

    tasks/
      task-001.md           ← 태스크 하나씩 순차 생성. current 없음.
      task-002.md

    self-review/
      current.md            ← 빌드 완료 기준 체크리스트

    pr/
      pr-2026-04-15.md      ← PR 초안. 매번 새로 생성. current 없음.

    retro.md                ← 프로젝트 끝날 때 딱 하나. 회고 + 개선점.
```

### current.md 업데이트 규칙

1. 사람이 승인하면 현재 `current.md`를 `YYYY-MM-DD.md`로 복사 (히스토리 보관)
2. `current.md`를 새 내용으로 덮어쓴다
3. 히스토리 파일은 수정하지 않는다 (불변)

---

## Phase 판단 기준

AI는 별도 메타데이터 없이 **파일 존재 여부**로 현재 단계를 판단한다.

| 조건 | 현재 단계 |
|---|---|
| `prd/` 없음 | Plan 진입 전 |
| `prd/current.md` 있음 + `spec/` 없음 | Plan 진행 중 |
| `spec/current.md` 있음 + `tasks/` 없음 | Design 진행 중 |
| `tasks/` 있음 + `self-review/` 없음 | Build 진행 중 |
| `self-review/current.md` 있음 + `pr/` 없음 | Deliver 준비 |
| `pr/` 있음 | Deliver 완료 |

---

## 단계별 AI 실행 흐름

### Plan 단계

**트리거 A — 미팅이 있는 경우**
```
1. 사람이 meeting/current.md에 미팅 내용 기록
2. AI: meeting 읽고 → cps/current.md 생성
3. 사람: 검토 → 승인 또는 피드백
4. AI: cps + 프로젝트 현황 감사 → prd/current.md 생성 (측정 가능한 목표 포함)
5. 사람: 검토 → 승인
```

**트리거 B — 혼자 시작하는 경우**
```
1. 사람: 한 마디 ("SEO 개선하고 싶어")
2. AI: 대화 기반으로 cps/current.md 생성
3. 사람: 검토 → 승인 또는 피드백
4. AI: cps 기반으로 prd/current.md 생성
5. 사람: 검토 → 승인
```

**Plan → Design 진입 조건**
- `prd/current.md`에 **측정 가능한 목표**가 명시되어 있을 것
- 예: "Lighthouse 65 → 90", "LCP 4.2s → 2.5s"
- 방향만 있는 상태("SEO 개선")는 미완료로 간주

---

### Design 단계

```
1. AI: prd 읽고 프로젝트 타입 판단 → spec/current.md 생성
2. 사람: 검토 → 승인 또는 피드백
3. AI: spec 기반으로 architecture/current.md 생성
4. 사람: 검토 → 승인 또는 피드백
5. AI: architecture 기반으로 tasks/task-001.md 생성
6. 사람: 검토 → 승인
```

**spec.md 생성 규칙 — 공통 섹션 (항상 포함)**
- 범위: 무엇을, 어디까지
- 완료 기준: 측정 가능한 수치
- 제약 조건
- 검증 방법

**spec.md 생성 규칙 — 타입별 자동 추가 (AI가 PRD 읽고 판단)**
| 타입 | 추가 섹션 |
|---|---|
| 기능 개발 | Input/Output, 엣지케이스 |
| 성능 개선 | 현재 수치, 목표 수치 |
| 버그 수정 | 재현 조건, 원인 분석 |
| 리팩토링 | 영향 범위, 변경 전/후 비교 |

---

### Build 단계

```
1. tasks/task-001.md 기준으로 AI 코드 구현
2. 사람: 코드 리뷰 → 승인
3. (다음 태스크 반복)
4. 모든 태스크 완료 후 AI: self-review/current.md 생성
5. 사람: 검토 → 승인
```

**task-{N}.md 포맷**
```markdown
# Task-{N}: {제목}

## 목적
## 참조 (spec 버전, 관련 파일)
## 구현 내용
## 완료 기준
## 검증 방법
```

---

### Deliver 단계

```
1. AI: spec, tasks, self-review 읽고 → pr/pr-{날짜}.md 생성
2. 사람: 검토 → 최종 승인
```

---

### 반복 사이클

```
Deliver 완료 → 결과 확인 → (미팅)
  ↓
meeting/current.md 업데이트 (이전본 날짜 파일로 보관)
  ↓
AI: 결과 기반으로 cps, prd 갱신 제안
사람: 검토 → 승인
  ↓
다음 사이클 시작 (Plan → Design → Build → Deliver)
```

---

### 프로젝트 종료

```
모든 사이클 완료
  ↓
AI: retro.md 생성
  - 최종 결과 수치
  - 잘 된 것 / 아쉬운 것
  - 다음 프로젝트에서 개선할 AI 프롬프트/접근 방식
사람: 검토 → 완료
```

---

## 리뷰 인터페이스 규칙

- 사람은 문서의 특정 텍스트를 선택해 인라인 코멘트를 달 수 있다
- 코멘트는 파일에 저장되지 않고 AI 대화로 전달된다
- AI는 코멘트를 반영해 `current.md`를 수정한다
- 승인 시 이전 `current.md`를 날짜 파일로 보관하고 새 내용으로 덮어쓴다

---

## 핵심 규칙 요약

1. **AI가 문서를 생성한다** — 사람이 직접 쓰는 것은 meeting.md 기록뿐
2. **사람은 승인 게이트에서만 개입한다** — 검토, 피드백, 승인
3. **current.md = 현재 진실** — 항상 최신 승인본
4. **날짜 파일 = 불변 히스토리** — 수정 금지
5. **폴더 구조 = 상태** — 별도 메타데이터 파일 불필요
6. **PRD에 측정 가능한 목표가 있어야** Design 진입 가능
7. **self-review 완료 후에만** PR 작성 가능

---

## 문서 간 의존 관계

```
meeting → cps → prd
                 ↓
              spec → architecture → tasks
                                      ↓
                                  (코드 구현)
                                      ↓
                               self-review → pr
                                              ↓
                                           retro
```

상위 문서가 변경되면 하위 문서를 재검토해야 한다.
특히 prd 변경 시 spec 재검토, spec 변경 시 tasks 재검토가 필요하다.
