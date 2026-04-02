import { useState, useEffect, useRef } from 'react'
import { PHASES } from '../entities/phase'
import { Header } from '../shared/ui/Header'
import { PhaseTabBar } from '../widgets/phase-tab-bar'
import { FileSidebar } from '../widgets/file-sidebar'
import { FileEditor } from '../widgets/file-editor'
import { fsAPI } from '../shared/api/fs'
import type { SaveStatus } from '../shared/types'

export function App() {
  const [projectPath, setProjectPath] = useState<string | null>(null)

  const [activePhaseId, setActivePhaseId] = useState(PHASES[0].id)
  const activePhase = PHASES.find((p) => p.id === activePhaseId)!

  const [activeFileId, setActiveFileId] = useState(activePhase.files[0].id)
  const activeFile = activePhase.files.find((f) => f.id === activeFileId) ?? activePhase.files[0]

  const [contents, setContents] = useState<Record<string, string>>(() =>
    Object.fromEntries(PHASES.flatMap((p) => p.files.map((f) => [f.id, f.template])))
  )
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const phaseIndex = PHASES.findIndex((p) => p.id === activePhaseId)

  // 프로젝트 열기 + .harness/ 초기화
  async function handleOpenFolder() {
    const path = await fsAPI.openFolder()
    if (!path) return

    // .harness/ 폴더 구조 생성
    for (const phase of PHASES) {
      await fsAPI.ensureDir(`${path}/.harness/${phase.id}`)
    }

    // 파일 로드 (없으면 템플릿 사용)
    const loaded: Record<string, string> = {}
    for (const phase of PHASES) {
      for (const file of phase.files) {
        const filePath = fsAPI.getHarnessFilePath(path, phase.id, file.name)
        const existing = await fsAPI.readFile(filePath)
        loaded[file.id] = existing ?? file.template
        // 새 파일이면 템플릿으로 초기화
        if (!existing) {
          await fsAPI.writeFile(filePath, file.template)
        }
      }
    }

    setContents(loaded)
    setProjectPath(path)
    setSaveStatus('saved')
  }

  function handlePhaseChange(phaseId: string) {
    setActivePhaseId(phaseId)
    const phase = PHASES.find((p) => p.id === phaseId)!
    setActiveFileId(phase.files[0].id)
  }

  function handleContentChange(value: string) {
    setContents((prev) => ({ ...prev, [activeFile.id]: value }))
    setSaveStatus('unsaved')

    // 1초 debounce 후 자동 저장
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (projectPath) {
        setSaveStatus('saving')
        const filePath = fsAPI.getHarnessFilePath(projectPath, activePhase.id, activeFile.name)
        fsAPI.writeFile(filePath, value).then(() => setSaveStatus('saved'))
      }
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  // ── 프로젝트 미선택 화면 ────────────────────────────
  if (!projectPath) {
    return (
      <div className="h-screen flex flex-col bg-white text-zinc-900 font-sans">
        <Header projectPath={null} saveStatus={null} onOpenFolder={handleOpenFolder} />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-zinc-800 mb-2">harness</p>
            <p className="text-sm text-zinc-400">프로젝트 폴더를 열어 시작하세요</p>
          </div>
          <button
            onClick={handleOpenFolder}
            className="px-6 py-2.5 bg-zinc-900 text-white text-sm rounded-md hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            폴더 열기
          </button>
        </div>
      </div>
    )
  }

  // ── 메인 에디터 화면 ────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-white text-zinc-900 font-sans">
      <Header projectPath={projectPath} saveStatus={saveStatus} onOpenFolder={handleOpenFolder} />
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
          onChange={handleContentChange}
        />
      </div>
    </div>
  )
}
