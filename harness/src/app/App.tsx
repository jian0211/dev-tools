import { useState } from 'react'
import type { FileEntry, PhaseStatus, Project } from '../entities/project'
import {
  archiveAndWrite,
  detectPhase,
  PHASE_FOLDERS,
  PHASE_GROUPS,
  phaseStatusToGroupId,
  saveCurrentFile,
  scanPhaseFolder,
} from '../entities/project'
import { readFile } from '../shared/lib/fs'
import { Header } from '../shared/ui/Header'
import { AiPanel } from '../widgets/ai-panel'
import { FileEditor } from '../widgets/file-editor'
import { FileSidebar } from '../widgets/file-sidebar'
import { PhaseTabBar } from '../widgets/phase-tab-bar'
import { ProjectSelector } from '../widgets/project-selector'

type ActiveFile = {
  entry: FileEntry
  folderName: string
  content: string
}

export function App() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [phaseStatus, setPhaseStatus] =
    useState<PhaseStatus>('plan-not-started')
  const [activePhaseId, setActivePhaseId] = useState<string>('plan')
  const [folderFiles, setFolderFiles] = useState<Record<string, FileEntry[]>>(
    {},
  )
  const [activeFolderName, setActiveFolderName] = useState<string>('prd')
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  /** 프로젝트 선택 시 초기화 */
  async function handleProjectSelect(project: Project) {
    setActiveProject(project)

    const status = await detectPhase(project.dirHandle)
    setPhaseStatus(status)

    const phaseId = phaseStatusToGroupId(status)
    setActivePhaseId(phaseId)
    await loadPhase(project, phaseId)
  }

  /** phase의 폴더들 파일 로드 */
  async function loadPhase(project: Project, phaseId: string) {
    const group = PHASE_GROUPS.find((g) => g.id === phaseId)
    if (!group) return

    const newFolderFiles: Record<string, FileEntry[]> = {}
    for (const folderName of group.folders) {
      const config = PHASE_FOLDERS.find((f) => f.folderName === folderName)
      if (!config) continue
      const entries = await scanPhaseFolder(project.dirHandle, folderName, {
        hasHistory: config.hasHistory,
        sequential: config.sequential,
      })
      newFolderFiles[folderName] = entries
    }
    setFolderFiles(newFolderFiles)

    // 첫 폴더, 첫 파일 자동 선택
    const firstFolder = group.folders[0]
    setActiveFolderName(firstFolder)
    const firstEntries = newFolderFiles[firstFolder] ?? []
    if (firstEntries.length > 0) {
      await selectFile(firstEntries[0], firstFolder)
    } else {
      setActiveFile(null)
    }
  }

  /** 파일 선택 */
  async function selectFile(entry: FileEntry, folderName: string) {
    const content = await readFile(entry.handle)
    setActiveFile({ entry, folderName, content })
  }

  /** 폴더 변경 */
  async function handleFolderChange(folderName: string) {
    setActiveFolderName(folderName)
    const entries = folderFiles[folderName] ?? []
    if (entries.length > 0) {
      await selectFile(entries[0], folderName)
    } else {
      setActiveFile(null)
    }
  }

  /** phase 탭 변경 */
  async function handlePhaseChange(phaseId: string) {
    if (!activeProject) return
    setActivePhaseId(phaseId)
    await loadPhase(activeProject, phaseId)
  }

  /** 에디터 내용 변경 (in-memory) */
  function handleContentChange(value: string) {
    if (!activeFile) return
    setActiveFile({ ...activeFile, content: value })
  }

  /** 저장 (아카이브 없이) */
  async function handleSave() {
    if (!activeProject || !activeFile?.entry.isEditable) return
    setIsSaving(true)
    try {
      await saveCurrentFile(
        activeProject.dirHandle,
        activeFile.folderName,
        activeFile.content,
      )
    } finally {
      setIsSaving(false)
    }
  }

  /** 아카이브 & 저장 (이전본 날짜 파일로 보관 후 current 갱신) */
  async function handleArchive() {
    if (!activeProject || !activeFile?.entry.isEditable) return
    setIsSaving(true)
    try {
      await archiveAndWrite(
        activeProject.dirHandle,
        activeFile.folderName,
        activeFile.content,
      )
      // 히스토리 목록 새로고침
      await loadPhase(activeProject, activePhaseId)
    } finally {
      setIsSaving(false)
    }
  }

  const currentGroup = PHASE_GROUPS.find((g) => g.id === activePhaseId)
  const currentFolders = currentGroup?.folders ?? []

  return (
    <div className="h-screen flex flex-col bg-white text-zinc-900 font-sans">
      <Header projectName={activeProject?.name} />

      {!activeProject ? (
        <ProjectSelector onProjectSelect={handleProjectSelect} />
      ) : (
        <>
          <PhaseTabBar
            phases={PHASE_GROUPS}
            activePhaseId={activePhaseId}
            phaseStatus={phaseStatus}
            onPhaseChange={handlePhaseChange}
          />

          <div className="flex flex-1 overflow-hidden">
            {/* 좌측: 폴더 탭 + 파일 목록 */}
            <FileSidebar
              folders={currentFolders.map((folderName) => {
                const config = PHASE_FOLDERS.find(
                  (f) => f.folderName === folderName,
                )
                return {
                  folderName,
                  label: config?.label ?? folderName,
                  hasFiles: (folderFiles[folderName] ?? []).length > 0,
                }
              })}
              activeFolderName={activeFolderName}
              onFolderChange={handleFolderChange}
              files={folderFiles[activeFolderName] ?? []}
              activeFileName={activeFile?.entry.name ?? ''}
              onFileChange={(entry) => selectFile(entry, activeFolderName)}
            />

            {/* 에디터 + AI 패널 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeFile ? (
                <FileEditor
                  folderName={activeFile.folderName}
                  fileName={activeFile.entry.name}
                  content={activeFile.content}
                  isEditable={activeFile.entry.isEditable}
                  isSaving={isSaving}
                  onChange={handleContentChange}
                  onSave={handleSave}
                  onArchive={handleArchive}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-zinc-300">
                  파일을 선택하거나 새로 만드세요
                </div>
              )}
              <AiPanel
                projectName={activeProject.name}
                phaseId={activePhaseId}
                folderName={activeFolderName}
                fileName={activeFile?.entry.name ?? ''}
                fileContent={activeFile?.content ?? ''}
                onApplyContent={(content) => {
                  if (activeFile?.entry.isEditable) {
                    handleContentChange(content)
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
