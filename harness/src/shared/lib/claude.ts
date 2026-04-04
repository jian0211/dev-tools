import Anthropic from '@anthropic-ai/sdk'
import { getApiKey } from './apiKey'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type StreamCallbacks = {
  onText: (text: string) => void
  onDone: (fullText: string) => void
  onError: (error: Error) => void
}

const HARNESS_SYSTEM = `당신은 Harness 개발 워크플로우 도구의 AI 어시스턴트입니다.

## Harness 워크플로우

Harness는 Plan → Design → Build → Deliver 4단계 개발 흐름을 파일 기반으로 관리합니다.

**핵심 패러다임: AI가 문서를 생성한다 → 사람이 검토/승인한다**

### 단계별 폴더와 문서
- **Plan**: meeting/ (회의록), cps/ (Context/Problem/Solution), prd/ (요건 정의)
- **Design**: spec/ (기능 스펙), architecture/ (구현 전략), tasks/ (태스크 목록)
- **Build**: self-review/ (완료 기준 체크리스트)
- **Deliver**: pr/ (PR 초안)

### current.md 업데이트 규칙
1. 승인 시 현재 current.md → YYYY-MM-DD.md로 히스토리 보관
2. current.md를 새 내용으로 덮어쓰기
3. 히스토리 파일은 절대 수정하지 않음 (불변)

### 핵심 규칙
1. AI가 문서를 생성한다 — 사람이 직접 쓰는 것은 meeting.md 기록뿐
2. 사람은 승인 게이트에서만 개입한다 — 검토, 피드백, 승인
3. current.md = 현재 진실 (항상 최신 승인본)
4. 폴더 구조 = 상태 (별도 메타데이터 불필요)
5. PRD에 측정 가능한 목표가 있어야 Design 진입 가능

### 문서 간 의존 관계
meeting → cps → prd → spec → architecture → tasks → (코드) → self-review → pr → retro

## 역할

당신은 사용자가 각 단계의 문서를 작성하고 개선하도록 돕습니다.
- 문서 초안/업데이트 요청 시: 완성된 마크다운 문서 전체를 생성하세요
- 피드백/수정 요청 시: 수정된 전체 문서를 다시 생성하세요
- 질문이나 조언 요청 시: 명확하고 구체적으로 답변하세요

**문서 내용을 제안할 때는 반드시 아래 태그로 감싸세요:**
<document>
[마크다운 내용]
</document>

이 태그 안의 내용은 사용자가 "문서에 적용" 버튼으로 에디터에 바로 적용할 수 있습니다.`

export async function streamMessage(
  messages: ChatMessage[],
  context: {
    projectName: string
    phaseId: string
    folderName: string
    fileName: string
    fileContent: string
  },
  callbacks: StreamCallbacks,
): Promise<void> {
  const apiKey = getApiKey()
  if (!apiKey) {
    callbacks.onError(new Error('API key not set'))
    return
  }

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  const systemPrompt = `${HARNESS_SYSTEM}

---

## 현재 컨텍스트

- 프로젝트: ${context.projectName}
- 단계(phase): ${context.phaseId}
- 폴더: ${context.folderName}
- 파일: ${context.fileName}

## 현재 파일 내용

\`\`\`markdown
${context.fileContent || '(비어있음 — 새 문서 생성 필요)'}
\`\`\``

  try {
    let fullText = ''

    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    stream.on('text', (text) => {
      fullText += text
      callbacks.onText(text)
    })

    await stream.finalMessage()
    callbacks.onDone(fullText)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  }
}

/** Claude 응답에서 <document>...</document> 블록 추출 */
export function extractDocument(text: string): string | null {
  const match = text.match(/<document>([\s\S]*?)<\/document>/)
  return match ? match[1].trim() : null
}

/** 화면 표시용: <document> 태그를 플레이스홀더로 치환 */
export function formatForDisplay(text: string): string {
  return text.replace(
    /<document>[\s\S]*?<\/document>/g,
    '📄 [문서 생성됨 — 아래 "문서에 적용" 버튼을 눌러주세요]',
  )
}
