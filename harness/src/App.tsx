import { useState } from 'react'
import { PHASES } from './data/phases'

export default function App() {
  const [activePhaseId, setActivePhaseId] = useState(PHASES[0].id)
  const activePhase = PHASES.find((p) => p.id === activePhaseId)!

  const [activeFileId, setActiveFileId] = useState(activePhase.files[0].id)
  const activeFile = activePhase.files.find((f) => f.id === activeFileId) ?? activePhase.files[0]

  const [contents, setContents] = useState<Record<string, string>>(() =>
    Object.fromEntries(PHASES.flatMap((p) => p.files.map((f) => [f.id, f.template])))
  )

  const phaseIndex = PHASES.findIndex((p) => p.id === activePhaseId)

  function handlePhaseChange(phaseId: string) {
    setActivePhaseId(phaseId)
    const phase = PHASES.find((p) => p.id === phaseId)!
    setActiveFileId(phase.files[0].id)
  }

  return (
    <div className="h-screen flex flex-col bg-white text-zinc-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200">
        <span className="text-sm font-semibold tracking-tight text-zinc-900">harness</span>
        <span className="text-xs text-zinc-400 font-mono">dev workflow</span>
      </header>

      {/* Step tabs */}
      <div className="px-6 pt-4 pb-0 border-b border-zinc-200">
        <div className="flex items-center gap-0">
          {PHASES.map((phase, i) => {
            const isActive = phase.id === activePhaseId
            const isDone = i < phaseIndex
            return (
              <button
                key={phase.id}
                onClick={() => handlePhaseChange(phase.id)}
                className={[
                  'flex items-center gap-2 px-5 py-2.5 text-sm border-b-2 transition-colors cursor-pointer',
                  isActive
                    ? 'border-zinc-900 text-zinc-900 font-medium'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-1.5 h-1.5 rounded-full',
                    isActive ? 'bg-zinc-900' : isDone ? 'bg-emerald-400' : 'bg-zinc-200',
                  ].join(' ')}
                />
                {phase.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* File list sidebar */}
        <aside className="w-44 shrink-0 border-r border-zinc-200 bg-zinc-50 py-3 overflow-y-auto">
          <ul>
            {activePhase.files.map((file) => {
              const isActive = file.id === activeFileId
              return (
                <li key={file.id}>
                  <button
                    onClick={() => setActiveFileId(file.id)}
                    className={[
                      'w-full text-left px-4 py-2 text-xs font-mono transition-colors cursor-pointer',
                      isActive
                        ? 'bg-zinc-200 text-zinc-900 font-semibold'
                        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800',
                    ].join(' ')}
                  >
                    {file.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-2.5 border-b border-zinc-100 flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">{activePhase.label.toLowerCase()}/</span>
            <span className="text-xs font-mono text-zinc-700">{activeFile.name}</span>
          </div>
          <textarea
            className="flex-1 w-full resize-none p-5 text-sm font-mono text-zinc-800 bg-white focus:outline-none leading-relaxed"
            value={contents[activeFile.id]}
            onChange={(e) =>
              setContents((prev) => ({ ...prev, [activeFile.id]: e.target.value }))
            }
            spellCheck={false}
          />
        </main>
      </div>
    </div>
  )
}
