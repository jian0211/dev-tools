import { useState, useCallback } from 'react'
import { PhaseTabBar } from '../widgets/phase-tab-bar'
import { FileSidebar } from '../widgets/file-sidebar'
import { FileEditor } from '../widgets/file-editor'
import { ProjectSelector } from '../widgets/project-selector'
import { Header } from '../shared/ui/Header'
import type { Project, PhaseStatus, FileEntry } from '../entities/project'
import {
  PHASE_GROUPS,
  PHASE_FOLDERS,
  detectPhase,
  scanPhaseFolder,
  saveCurrentFile,
  archiveAndWrite,
} from '../entities/project'
import { readFile } from '../shared/lib/fs'

type ActiveFile = {
  entry: FileEntry
  folderName: string
  content: string
}

export function App() {
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatus>('plan-not-started')
  const [activePhaseId, setActivePhaseId] = useState<string>('plan')
  const [folderFiles, setFolderFiles] = useState<Record<string, FileEntry[]>>({})
  const [activeFolderName, setActiveFolderName] = useState<string>('prd')
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  /** 프로젝트 선택 시 초기화 */
  const handleProjectSelect = useCallback(
    async (project: Project, _root: FileSystemDirectoryHandle) => {
      setActiveProject(project)

      const status = await detectPhase(project.dirHandle)
      setPhaseStatus(status)

      const phaseId = phaseStatusToGroupId(status)
      setActivePhaseId(phaseId)
      await loadPhase(project, phaseId)
    },
    []
  )

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
    if (!activeProject || !activeFile || !activeFile.entry.isEditable) return
    setIsSaving(true)
    try {
      await saveCurrentFile(activeProject.dirHandle, activeFile.folderName, activeFile.content)
    } finally {
      setIsSaving(false)
    }
  }

  /** 아카이브 & 저장 (이전본 날짜 파일로 보관 후 current 갱신) */
  async function handleArchive() {
    if (!activeProject || !activeFile || !activeFile.entry.isEditable) return
    setIsSaving(true)
    try {
      await archiveAndWrite(activeProject.dirHandle, activeFile.folderName, activeFile.content)
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
            <div className="flex flex-col w-44 shrink-0 border-r border-zinc-200 bg-zinc-50">
              {/* 폴더 탭 */}
              <div className="border-b border-zinc-200">
                {currentFolders.map((folderName) => {
                  const config = PHASE_FOLDERS.find((f) => f.folderName === folderName)
                  const isActive = folderName === activeFolderName
                  const hasFiles = (folderFiles[folderName] ?? []).length > 0
                  return (
                    <button
                      key={folderName}
                      onClick={() => handleFolderChange(folderName)}
                      className={[
                        'w-full text-left px-4 py-2.5 text-xs font-mono transition-colors flex items-center justify-between',
                        isActive
                          ? 'bg-zinc-100 text-zinc-900 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50',
                      ].join(' ')}
                    >
                      <span>{config?.label ?? folderName}</span>
                      {hasFiles && <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                    </button>
                  )
                })}
              </div>

              {/* 파일 목록 */}
              <FileSidebar
                folderName={activeFolderName}
                files={folderFiles[activeFolderName] ?? []}
                activeFileName={activeFile?.entry.name ?? ''}
                onFileChange={(entry) => selectFile(entry, activeFolderName)}
              />
            </div>

            {/* 에디터 */}
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
          </div>
        </>
      )}
    </div>
  )
}

function phaseStatusToGroupId(status: PhaseStatus): string {
  switch (status) {
    case 'plan-not-started':
    case 'plan-in-progress':
      return 'plan'
    case 'design':
      return 'design'
    case 'build':
      return 'build'
    case 'deliver-ready':
    case 'deliver-done':
      return 'deliver'
  }
}
