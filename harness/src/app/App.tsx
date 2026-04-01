import { useState } from 'react'
import { PHASES } from '../entities/phase'
import { Header } from '../shared/ui/Header'
import { PhaseTabBar } from '../widgets/phase-tab-bar'
import { FileSidebar } from '../widgets/file-sidebar'
import { FileEditor } from '../widgets/file-editor'

export function App() {
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
      <Header />
      <PhaseTabBar
        phases={PHASES}
        activePhaseId={activePhaseId}
        phaseIndex={phaseIndex}
        onPhaseChange={handlePhaseChange}
      />
      <div className="flex flex-1 overflow-hidden">
        <FileSidebar
          files={activePhase.files}
          activeFileId={activeFileId}
          onFileChange={setActiveFileId}
        />
        <FileEditor
          phaseLabel={activePhase.label}
          fileName={activeFile.name}
          content={contents[activeFile.id]}
          onChange={(value) =>
            setContents((prev) => ({ ...prev, [activeFile.id]: value }))
          }
        />
      </div>
    </div>
  )
}
