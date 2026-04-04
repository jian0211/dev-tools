import { useState, useEffect } from 'react'
import type { FileEntry, PhaseStatus, Project } from '../model/types.js'
import {
  PHASE_FOLDERS,
  PHASE_GROUPS,
  phaseStatusToGroupId,
} from '../model/types.js'
import {
  archiveAndWrite,
  detectPhase,
  scanPhaseFolder,
} from '../model/projectFs.js'
import { readFile } from '../lib/fs.js'

/** 워크스페이스 상태만 담당 — phase, 폴더, 파일, 문서 승인 */
export function useWorkspace(project: Project) {
  const [error, setError] = useState('')
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatus>('plan-not-started')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [folderFiles, setFolderFiles] = useState<Record<string, FileEntry[]>>({})
  const [folderIdx, setFolderIdx] = useState(0)
  const [fileIdx, setFileIdx] = useState(0)
  const [fileContent, setFileContent] = useState('')
  const [pendingDocument, setPendingDocument] = useState<string | null>(null)

  const phase = PHASE_GROUPS[phaseIdx]
  const folders = phase?.folders ?? []
  const folderName = folders[folderIdx] ?? ''
  const files = folderFiles[folderName] ?? []
  const activeFile = files[fileIdx] ?? null

  // phase 감지
  useEffect(() => {
    detectPhase(project.dirPath)
      .then((status) => {
        setPhaseStatus(status)
        const id = phaseStatusToGroupId(status)
        const idx = PHASE_GROUPS.findIndex((g) => g.id === id)
        setPhaseIdx(idx >= 0 ? idx : 0)
      })
      .catch((e) => setError(String(e)))
  }, [project.dirPath])

  // 폴더 파일 로드
  useEffect(() => {
    if (!phase) return
    ;(async () => {
      try {
        const result: Record<string, FileEntry[]> = {}
        for (const fn of phase.folders) {
          const config = PHASE_FOLDERS.find((f) => f.folderName === fn)
          if (!config) continue
          result[fn] = await scanPhaseFolder(project.dirPath, fn, {
            hasHistory: config.hasHistory,
            sequential: config.sequential,
          })
        }
        setFolderFiles(result)
        setFolderIdx(0)
        setFileIdx(0)
      } catch (e) { setError(String(e)) }
    })()
  }, [project.dirPath, phaseIdx])

  // 파일 내용 로드
  useEffect(() => {
    if (!activeFile) { setFileContent(''); return }
    readFile(activeFile.path).then(setFileContent).catch(() => setFileContent(''))
  }, [activeFile?.path])

  async function approve() {
    if (!pendingDocument) return
    try {
      await archiveAndWrite(project.dirPath, folderName, pendingDocument)
      setPendingDocument(null)
      const config = PHASE_FOLDERS.find((f) => f.folderName === folderName)
      if (config) {
        const entries = await scanPhaseFolder(project.dirPath, folderName, {
          hasHistory: config.hasHistory,
          sequential: config.sequential,
        })
        setFolderFiles((prev) => ({ ...prev, [folderName]: entries }))
        setFileIdx(0)
      }
    } catch (e) { setError(String(e)) }
  }

  function reject() { setPendingDocument(null) }

  return {
    error, setError,
    phaseStatus, phase, phaseIdx,
    folders, folderName, folderFiles, files,
    activeFile, fileIdx, fileContent,
    pendingDocument, setPendingDocument,
    nextPhase: () => setPhaseIdx((i) => Math.min(PHASE_GROUPS.length - 1, i + 1)),
    prevPhase: () => setPhaseIdx((i) => Math.max(0, i - 1)),
    nextFile: () => setFileIdx((i) => Math.min(files.length - 1, i + 1)),
    prevFile: () => setFileIdx((i) => Math.max(0, i - 1)),
    approve,
    reject,
  }
}
