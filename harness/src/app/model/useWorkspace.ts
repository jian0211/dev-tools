import { useState } from 'react'
import type { FileEntry, PhaseStatus, Project } from '../../entities/project'
import {
  archiveAndWrite,
  detectPhase,
  PHASE_FOLDERS,
  PHASE_GROUPS,
  phaseStatusToGroupId,
  saveCurrentFile,
  scanPhaseFolder,
} from '../../entities/project'
import { readFile } from '../../shared/lib/fs'

export type ActiveFile = {
  entry: FileEntry
  folderName: string
  content: string
}

export function useWorkspace() {
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

  /** 프로젝트 선택 시 초기화 */
  async function handleProjectSelect(project: Project) {
    setActiveProject(project)

    const status = await detectPhase(project.dirHandle)
    setPhaseStatus(status)

    const phaseId = phaseStatusToGroupId(status)
    setActivePhaseId(phaseId)
    await loadPhase(project, phaseId)
  }

  /** phase 탭 변경 */
  async function handlePhaseChange(phaseId: string) {
    if (!activeProject) return
    setActivePhaseId(phaseId)
    await loadPhase(activeProject, phaseId)
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

  /** 아카이브 & 저장 */
  async function handleArchive() {
    if (!activeProject || !activeFile?.entry.isEditable) return
    setIsSaving(true)
    try {
      await archiveAndWrite(
        activeProject.dirHandle,
        activeFile.folderName,
        activeFile.content,
      )
      await loadPhase(activeProject, activePhaseId)
    } finally {
      setIsSaving(false)
    }
  }

  const currentGroup = PHASE_GROUPS.find((g) => g.id === activePhaseId)
  const currentFolders = currentGroup?.folders ?? []

  return {
    activeProject,
    phaseStatus,
    activePhaseId,
    folderFiles,
    activeFolderName,
    activeFile,
    isSaving,
    currentFolders,
    handleProjectSelect,
    handlePhaseChange,
    handleFolderChange,
    selectFile,
    handleContentChange,
    handleSave,
    handleArchive,
  }
}
