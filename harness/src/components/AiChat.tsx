import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import { useState } from 'react'
import { extractDocument, formatForDisplay, streamMessage } from '../lib/claude.js'

type Message = { role: 'user' | 'assistant'; content: string }

type Props = {
  projectName: string
  phaseId: string
  folderName: string
  fileName: string
  fileContent: string
  onDocumentGenerated: (content: string) => void
  isInputActive: boolean
}

export function AiChat({
  projectName,
  phaseId,
  folderName,
  fileName,
  fileContent,
  onDocumentGenerated,
  isInputActive,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleSubmit(value: string) {
    if (!value.trim() || isStreaming) return

    const userMsg: Message = { role: 'user', content: value.trim() }
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    await streamMessage(
      value.trim(),
      { projectName, phaseId, folderName, fileName, fileContent },
      {
        onText: (text) => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + text }
            }
            return updated
          })
        },
        onDone: (fullText) => {
          setIsStreaming(false)
          const doc = extractDocument(fullText)
          if (doc) onDocumentGenerated(doc)
        },
        onError: (err) => {
          setIsStreaming(false)
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: `오류: ${err.message}` }
            }
            return updated
          })
        },
      },
    )
  }

  // 최근 메시지만 표시 (터미널 공간 절약)
  const visible = messages.slice(-6)

  return (
    <Box flexDirection="column" flexGrow={1} borderStyle="single">
      <Box paddingX={1}>
        <Text bold color="green">AI Chat</Text>
        {isStreaming && <Text color="yellow"> ●</Text>}
      </Box>

      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {visible.length === 0 ? (
          <Text dimColor>AI에게 "{folderName}" 문서 작성을 요청하세요</Text>
        ) : (
          visible.map((msg, i) => {
            const key = `${msg.role}-${i}`
            const display = msg.role === 'assistant' ? formatForDisplay(msg.content) : msg.content
            return (
              <Box key={key} marginBottom={1}>
                <Text color={msg.role === 'user' ? 'cyan' : 'white'}>
                  {msg.role === 'user' ? '> ' : 'AI: '}
                  {display || (isStreaming ? '...' : '')}
                </Text>
              </Box>
            )
          })
        )}
      </Box>

      <Box paddingX={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
        {isInputActive && !isStreaming ? (
          <Box>
            <Text color="green">{'> '}</Text>
            <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
          </Box>
        ) : (
          <Text dimColor>{isStreaming ? '응답 중...' : 'Tab으로 입력 전환'}</Text>
        )}
      </Box>
    </Box>
  )
}
