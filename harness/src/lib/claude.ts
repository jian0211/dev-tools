import { spawn } from 'node:child_process'

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
  const fullPrompt = `${HARNESS_SYSTEM}

현재 컨텍스트:
- 프로젝트: ${context.projectName}
- 단계: ${context.phaseId}
- 폴더: ${context.folderName}
- 파일: ${context.fileName}

현재 파일 내용:
${context.fileContent || '(비어있음 — 새 문서 생성 필요)'}

---

사용자 요청: ${userPrompt}`

  try {
    const proc = spawn('claude', ['--print', '--output-format', 'text', '-p', fullPrompt], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let fullText = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      fullText += text
      callbacks.onText(text)
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      const errText = chunk.toString()
      if (errText.trim()) {
        callbacks.onError(new Error(errText))
      }
    })

    await new Promise<void>((resolve, reject) => {
      proc.on('close', (code: number | null) => {
        if (code === 0) {
          callbacks.onDone(fullText)
          resolve()
        } else {
          reject(new Error(`claude exited with code ${code}`))
        }
      })
      proc.on('error', reject)
    })
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
