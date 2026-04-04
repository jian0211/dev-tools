import { todayString } from '../../../shared/lib/date'
import {
  dirExists,
  fileExists,
  getDirHandle,
  getOrCreateDir,
  getOrCreateFile,
  listDirEntries,
  readFile,
  writeFile,
} from '../../../shared/lib/fs'
import type { FileEntry, PhaseStatus, Project } from './types'

const HARNESS_DIR = '.harness'

/** 루트 디렉토리에서 .harness/ 핸들을 가져오거나 생성 */
async function getHarnessDir(
  root: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle> {
  return await getOrCreateDir(root, HARNESS_DIR)
}

/** .harness/ 안의 프로젝트 목록 반환 */
export async function listProjects(
  root: FileSystemDirectoryHandle,
): Promise<Project[]> {
  const harnessDir = await getHarnessDir(root)
  const entries = await listDirEntries(harnessDir)
  const projects: Project[] = []
  for (const [name, handle] of entries) {
    if (handle.kind === 'directory') {
      projects.push({ name, dirHandle: handle as FileSystemDirectoryHandle })
    }
  }
  return projects.sort((a, b) => a.name.localeCompare(b.name))
}

/** 새 프로젝트 디렉토리 생성 */
export async function createProject(
  root: FileSystemDirectoryHandle,
  name: string,
): Promise<Project> {
  const harnessDir = await getHarnessDir(root)
  const dirHandle = await getOrCreateDir(harnessDir, name)
  return { name, dirHandle }
}

/**
 * 파일 존재 여부만으로 현재 phase 판단
 * 폴더 구조 자체가 상태 머신 역할
 */
export async function detectPhase(
  projectDir: FileSystemDirectoryHandle,
): Promise<PhaseStatus> {
  const hasPrdDir = await dirExists(projectDir, 'prd')
  const hasSpecDir = await dirExists(projectDir, 'spec')
  const hasTasksDir = await dirExists(projectDir, 'tasks')
  const hasReviewDir = await dirExists(projectDir, 'self-review')
  const hasPrDir = await dirExists(projectDir, 'pr')

  if (!hasPrdDir) return 'plan-not-started'

  const prdDir = await getDirHandle(projectDir, 'prd')
  const hasPrdCurrent = prdDir ? await fileExists(prdDir, 'current.md') : false

  if (!hasPrdCurrent || !hasSpecDir) return 'plan-in-progress'
  if (!hasTasksDir) return 'design'
  if (!hasReviewDir) return 'build'

  const reviewDir = await getDirHandle(projectDir, 'self-review')
  const hasReviewCurrent = reviewDir
    ? await fileExists(reviewDir, 'current.md')
    : false

  if (!hasReviewCurrent || !hasPrDir) return 'deliver-ready'
  return 'deliver-done'
}

/**
 * phase 폴더를 스캔해서 FileEntry 배열 반환
 * - hasHistory=true: current.md + YYYY-MM-DD.md 파일들
 * - sequential=true: task-NNN.md 또는 pr-*.md 파일들
 */
export async function scanPhaseFolder(
  projectDir: FileSystemDirectoryHandle,
  folderName: string,
  options: { hasHistory: boolean; sequential: boolean },
): Promise<FileEntry[]> {
  const dir = await getDirHandle(projectDir, folderName)
  if (!dir) return []

  const entries = await listDirEntries(dir)
  const fileEntries: FileEntry[] = []

  for (const [name, handle] of entries) {
    if (handle.kind !== 'file') continue
    if (!name.endsWith('.md')) continue

    const fileHandle = handle as FileSystemFileHandle

    if (options.sequential) {
      fileEntries.push({
        kind: 'sequential',
        name,
        handle: fileHandle,
        isEditable: true,
      })
    } else if (name === 'current.md') {
      fileEntries.push({
        kind: 'current',
        name,
        handle: fileHandle,
        isEditable: true,
      })
    } else if (/^\d{4}-\d{2}-\d{2}\.md$/.test(name)) {
      fileEntries.push({
        kind: 'history',
        name,
        handle: fileHandle,
        isEditable: false,
      })
    }
  }

  // current 먼저, 그 다음 history 최신순
  fileEntries.sort((a, b) => {
    if (a.kind === 'current') return -1
    if (b.kind === 'current') return 1
    return b.name.localeCompare(a.name)
  })

  return fileEntries
}

/**
 * current.md를 날짜 파일로 아카이브한 뒤 새 내용으로 덮어쓴다
 * 승인 시 호출
 */
export async function archiveAndWrite(
  projectDir: FileSystemDirectoryHandle,
  folderName: string,
  newContent: string,
): Promise<void> {
  const dir = await getOrCreateDir(projectDir, folderName)
  const currentHandle = await getOrCreateFile(dir, 'current.md')
  const existingContent = await readFile(currentHandle)

  // 기존 내용이 있으면 날짜 파일로 보관
  if (existingContent.trim()) {
    const dateFile = await getOrCreateFile(dir, `${todayString()}.md`)
    await writeFile(dateFile, existingContent)
  }

  // current.md 덮어쓰기
  await writeFile(currentHandle, newContent)
}

/**
 * current.md 저장 (아카이브 없이 단순 저장)
 */
export async function saveCurrentFile(
  projectDir: FileSystemDirectoryHandle,
  folderName: string,
  content: string,
): Promise<void> {
  const dir = await getOrCreateDir(projectDir, folderName)
  const handle = await getOrCreateFile(dir, 'current.md')
  await writeFile(handle, content)
}
