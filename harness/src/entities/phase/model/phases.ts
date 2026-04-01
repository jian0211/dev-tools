import type { Phase } from './types'

export const PHASES: Phase[] = [
  {
    id: 'plan',
    label: 'Plan',
    files: [
      {
        id: 'meeting',
        name: 'meeting.md',
        template: `# Meeting Log

## Summary
-

## Key Points
-

## Decisions
-

## Action Items
-

## Open Questions
-
`,
      },
      {
        id: 'cps',
        name: 'cps.md',
        template: `# CPS (Context / Problem / Solution)

## Context
- 현재 상황:
- 관련 시스템:
- 배경:

## Problem
- 핵심 문제:
- 왜 중요한가:
- 현재 한계:

## Solution (Draft)
- 해결 방향:
- 대안:
- 제약사항:
- 불확실성:
`,
      },
      {
        id: 'prd',
        name: 'prd.md',
        template: `# PRD

version: v1.0

## Why
-

## Goal
-

## Non-goals
-

## User Scenario
-

## Functional Requirements
-

## Constraints
-

## Acceptance Criteria
- [ ]
- [ ]

## Risks
-
`,
      },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    files: [
      {
        id: 'spec',
        name: 'spec.md',
        template: `# Spec

version: v1.0

## Feature
-

## Inputs / Outputs
- Input:
- Output:

## Rules
-

## Edge Cases
-

## Acceptance Criteria
- [ ]
- [ ]

## Test Considerations
- 정상 케이스:
- 실패 케이스:
- 경계 케이스:
`,
      },
      {
        id: 'architecture',
        name: 'architecture.md',
        template: `# Architecture / Implementation Strategy

## Affected Areas
- 파일:

## Approach
-

## Data Flow
-

## Reuse
-

## Key Decisions
-

## Risks
-
`,
      },
      {
        id: 'tasks',
        name: 'tasks.md',
        template: `# Task Breakdown

## Task 1.

### Spec Version
v1.0

### Purpose
-

### References
- Spec:
- Architecture:

### Related Files
-

### Done Criteria
- [ ]
- [ ]

### Validation
- test:
- manual:
`,
      },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    files: [
      {
        id: 'self_review',
        name: 'self_review.md',
        template: `# Self Review

## Requirement Check
- [ ] Spec 충족
- [ ] Acceptance criteria 만족

## Code Quality
- [ ] 불필요한 코드 없음
- [ ] 기존 패턴 유지

## Risk Check
- [ ] 사이드 이펙트 없음
- [ ] 에러 처리 존재

## Test Check
- [ ] 테스트 통과
- [ ] edge case 포함

## Notes
-
`,
      },
    ],
  },
  {
    id: 'deliver',
    label: 'Deliver',
    files: [
      {
        id: 'pr',
        name: 'pr.md',
        template: `# PR Draft

## Summary
-

## Why
-

## Changes
-

## Tests
-

## Risks
-

## Traceability
- PRD:
- Spec:
- Tasks:

## Review Points
-
`,
      },
    ],
  },
]
