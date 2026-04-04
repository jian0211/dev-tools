import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { getApiKey, setApiKey } from '../../../shared/lib/apiKey'
import {
  type ChatMessage,
  extractDocument,
  formatForDisplay,
  streamMessage,
} from '../../../shared/lib/claude'

type Props = {
  projectName: string
  phaseId: string
  folderName: string
  fileName: string
  fileContent: string
  onApplyContent: (content: string) => void
}

export function AiPanel({
  projectName,
  phaseId,
  folderName,
  fileName,
  fileContent,
  onApplyContent,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKeyForm, setShowApiKeyForm] = useState(!getApiKey())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen])

  function handleSaveApiKey() {
    if (!apiKeyInput.trim()) return
    setApiKey(apiKeyInput.trim())
    setShowApiKeyForm(false)
    setApiKeyInput('')
  }

  async function handleSend() {
    if (!input.trim() || isStreaming) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    await streamMessage(
      nextMessages,
      { projectName, phaseId, folderName, fileName, fileContent },
      {
        onText: (text) => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + text,
              }
            }
            return updated
          })
        },
        onDone: () => {
          setIsStreaming(false)
        },
        onError: (err) => {
          setIsStreaming(false)
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === 'assistant' && last.content === '') {
              updated[updated.length - 1] = {
                ...last,
                content: `오류: ${err.message}`,
              }
            }
            return updated
          })
        },
      },
    )
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="border-t border-zinc-200 flex flex-col bg-white"
      style={{ height: isOpen ? '320px' : 'auto' }}
    >
      {/* Toggle bar */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center justify-between px-5 py-2.5 text-xs text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide text-zinc-500">AI</span>
          {messages.length > 0 && (
            <span className="bg-zinc-100 text-zinc-500 rounded-full px-1.5 py-0.5 text-[10px] font-mono">
              {messages.length}
            </span>
          )}
          {isStreaming && (
            <span className="text-emerald-500 animate-pulse">●</span>
          )}
        </div>
        <span className="text-[10px]">{isOpen ? '▼' : '▲'}</span>
      </button>

      {isOpen &&
        (showApiKeyForm ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <p className="text-xs text-zinc-500">
              Anthropic API 키를 입력하세요 (로컬 저장)
            </p>
            <div className="flex gap-2 w-full max-w-md">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                placeholder="sk-ant-..."
                className="flex-1 text-xs font-mono border border-zinc-200 rounded px-3 py-2 focus:outline-none focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim()}
                className="text-xs bg-zinc-800 text-white px-3 py-2 rounded hover:bg-zinc-700 disabled:opacity-40"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-xs text-zinc-300 text-center py-6">
                  현재 문서에 대해 질문하거나 수정을 요청하세요
                </p>
              )}
              {messages.map((msg, i) => {
                const isLast = i === messages.length - 1
                const docContent =
                  msg.role === 'assistant' ? extractDocument(msg.content) : null
                const displayText =
                  msg.role === 'assistant'
                    ? formatForDisplay(msg.content)
                    : msg.content
                const msgKey = `${msg.role}-${i}`

                return (
                  <div
                    key={msgKey}
                    className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={[
                        'text-xs rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-zinc-800 text-white'
                          : 'bg-zinc-100 text-zinc-800',
                      ].join(' ')}
                    >
                      {displayText || (isStreaming && isLast ? '···' : '')}
                    </div>
                    {docContent && !isStreaming && (
                      <button
                        type="button"
                        onClick={() => onApplyContent(docContent)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-0.5 rounded hover:bg-emerald-50 transition-colors"
                      >
                        ✓ 문서에 적용
                      </button>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-3 flex gap-2 items-end border-t border-zinc-100 pt-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="문서에 대해 질문하거나 수정을 요청하세요… (Enter 전송 / Shift+Enter 줄바꿈)"
                rows={2}
                disabled={isStreaming}
                className="flex-1 text-xs font-mono resize-none border border-zinc-200 rounded px-3 py-2 focus:outline-none focus:border-zinc-400 leading-relaxed disabled:opacity-50"
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                  className="text-xs bg-zinc-800 text-white px-3 py-2 rounded hover:bg-zinc-700 disabled:opacity-40 whitespace-nowrap"
                >
                  전송
                </button>
                <button
                  type="button"
                  onClick={() => setShowApiKeyForm(true)}
                  className="text-[10px] text-zinc-300 hover:text-zinc-500 text-center"
                  title="API 키 변경"
                >
                  ⚙ 키
                </button>
              </div>
            </div>
          </>
        ))}
    </div>
  )
}
