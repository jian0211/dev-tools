# Dev Tools — Claude Guide

## 프로젝트 개요

개발자가 AI와 협업하며 진행하는 Dev Workflow 도구 모음.  
사람이 주도하고 AI가 각 단계에서 보조하는 구조.

---

## 패키지 구조

```
dev-tools/
  harness/    ← 메인 앱 (React + Vite + Tailwind)
  study/
  ai/
```

---

## harness 앱

### 개념

Plan → Design → Build → Deliver 4단계 개발 흐름을 파일 기반으로 관리하는 워크플로우 도구.  
각 단계의 산출물(MD 파일)이 `.harness/` 폴더에 남아 추적 가능한 상태를 유지한다.

### 워크플로우 단계

| 단계 | 파일 | 목적 |
|---|---|---|
| Plan | `meeting.md` | 회의 요약 / 결정 사항 / 액션 아이템 |
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
4. PR 전에 반드시 `self_review.md`를 작성한다
5. 각 팀 / 프로젝트에 맞게 템플릿을 커스텀할 수 있다

---

## harness 소스 구조 (Simple FSD)

```
harness/src/
  app/
    App.tsx              ← 상태 관리 + 위젯 조합 (composition root)
    index.css            ← 전역 스타일 (Tailwind)
  entities/
    phase/
      model/
        types.ts         ← Phase, FileItem 타입 정의
        phases.ts        ← PHASES 데이터 (4단계 + 파일 템플릿)
      index.ts           ← re-export
  widgets/
    phase-tab-bar/
      ui/PhaseTabBar.tsx ← 단계 탭 UI
      index.ts
    file-sidebar/
      ui/FileSidebar.tsx ← 파일 목록 사이드바 UI
      index.ts
    file-editor/
      ui/FileEditor.tsx  ← 마크다운 텍스트 에디터 UI
      index.ts
  shared/
    ui/
      Header.tsx         ← 공통 헤더
  main.tsx               ← 앱 진입점
```

### FSD 레이어 규칙

- **app** → 앱 전체 설정, 상태 조합. 하위 레이어 모두 import 가능.
- **widgets** → 독립적인 UI 블록. `entities`, `shared`만 import.
- **entities** → 비즈니스 타입과 데이터. `shared`만 import.
- **shared** → 재사용 공통 UI / 유틸. 다른 레이어 import 금지.
- 상위 레이어가 하위 레이어를 import하는 단방향 의존성 유지.
- 같은 레이어 간 cross-import 금지 (예: widget → widget).

### 새 파일 추가 시 위치 판단 기준

| 추가할 것 | 위치 |
|---|---|
| 새 비즈니스 타입 / 데이터 | `entities/<도메인>/model/` |
| 새 UI 블록 (독립 기능) | `widgets/<이름>/ui/` + `index.ts` |
| 재사용 UI 컴포넌트 | `shared/ui/` |
| 앱 전역 설정 / Provider | `app/` |

---

## 개발 명령어

```bash
cd harness
npm install   # 의존성 설치
npm run dev   # 개발 서버
npm run build # 프로덕션 빌드
```

---

## Git 브랜치 전략

- 기능 개발은 `claude/<feature>-<id>` 브랜치에서 진행
- main 직접 push 금지
