import { query } from '@anthropic-ai/claude-agent-sdk'

const HARNESS_SYSTEM = `당신은 Harness 개발 워크플로우 도구의 AI 어시스턴트입니다.

Harness는 Plan → Design → Build → Deliver 4단계 개발 흐름을 파일 기반으로 관리합니다.
핵심 패러다임: AI가 문서를 생성한다 → 사람이 검토/승인한다

단계별 폴더: meeting → cps → prd → spec → architecture → tasks → self-review → pr

문서 내용을 제안할 때는 반드시 아래 태그로 감싸세요:
<document>
[마크다운 내용]
</document>

파일 내용이 비어있으면 초안 작성을 먼저 제안하세요.`

export type StreamCallbacks = {
  onText: (text: string) => void
  onDone: (fullText: string) => void
  onError: (error: Error) => void
}

export async function streamMessage(
  userPrompt: string,
  context: {
    projectName: string
    phaseId: string
    folderName: string
    fileName: string
    fileContent: string
  },
  callbacks: StreamCallbacks,
): Promise<void> {
  const systemPrompt = `${HARNESS_SYSTEM}

현재 컨텍스트:
- 프로젝트: ${context.projectName}
- 단계: ${context.phaseId}
- 폴더: ${context.folderName}
- 파일: ${context.fileName}

현재 파일 내용:
${context.fileContent || '(비어있음 — 새 문서 생성 필요)'}`

  try {
    let fullText = ''

    for await (const message of query({
      prompt: userPrompt,
      options: {
        maxTurns: 1,
        systemPrompt,
        allowedTools: [],
      },
    })) {
      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            fullText += block.text
            callbacks.onText(block.text)
          }
        }
      }
    }

    callbacks.onDone(fullText)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  }
}

/** <document>...</document> 블록 추출 */
export function extractDocument(text: string): string | null {
  const match = text.match(/<document>([\s\S]*?)<\/document>/)
  return match ? match[1].trim() : null
}

/** <document> 태그를 플레이스홀더로 치환 */
export function formatForDisplay(text: string): string {
  return text.replace(
    /<document>[\s\S]*?<\/document>/g,
    '[문서 생성됨 — 오른쪽 패널에서 확인]',
  )
}
