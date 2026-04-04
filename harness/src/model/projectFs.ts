import { join } from 'node:path'
import { todayString } from '../lib/date.js'
import {
  dirExists,
  fileExists,
  getDirPath,
  getOrCreateDir,
  listDirEntries,
  readFile,
  writeFile,
} from '../lib/fs.js'
import type { FileEntry, PhaseStatus, Project } from './types.js'

const HARNESS_DIR = '.harness'

/** .harness/ 경로 반환. 존재하지 않으면 null. */
async function getHarnessDir(root: string): Promise<string | null> {
  return await getDirPath(root, HARNESS_DIR)
}

/** .harness/ 경로 반환. 없으면 생성. */
async function getOrCreateHarnessDir(root: string): Promise<string> {
  return await getOrCreateDir(root, HARNESS_DIR)
}

/** .harness/ 안의 프로젝트 목록 반환 */
export async function listProjects(root: string): Promise<Project[]> {
  const harnessDir = await getHarnessDir(root)
  if (!harnessDir) return []
  const entries = await listDirEntries(harnessDir)
  return entries
    .filter(([, kind]) => kind === 'directory')
    .map(([name]) => ({ name, dirPath: join(harnessDir, name) }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** 새 프로젝트 디렉토리 생성 */
export async function createProject(
  root: string,
  name: string,
): Promise<Project> {
  const harnessDir = await getOrCreateHarnessDir(root)
  const dirPath = await getOrCreateDir(harnessDir, name)
  return { name, dirPath }
}

/** 파일 존재 여부만으로 현재 phase 판단 */
export async function detectPhase(projectDir: string): Promise<PhaseStatus> {
  const hasPrdDir = await dirExists(projectDir, 'prd')
  const hasSpecDir = await dirExists(projectDir, 'spec')
  const hasTasksDir = await dirExists(projectDir, 'tasks')
  const hasReviewDir = await dirExists(projectDir, 'self-review')
  const hasPrDir = await dirExists(projectDir, 'pr')

  if (!hasPrdDir) return 'plan-not-started'

  const prdDir = await getDirPath(projectDir, 'prd')
  const hasPrdCurrent = prdDir ? await fileExists(prdDir, 'current.md') : false

  if (!hasPrdCurrent || !hasSpecDir) return 'plan-in-progress'
  if (!hasTasksDir) return 'design'
  if (!hasReviewDir) return 'build'

  const reviewDir = await getDirPath(projectDir, 'self-review')
  const hasReviewCurrent = reviewDir
    ? await fileExists(reviewDir, 'current.md')
    : false

  if (!hasReviewCurrent || !hasPrDir) return 'deliver-ready'
  return 'deliver-done'
}

/** phase 폴더를 스캔해서 FileEntry 배열 반환 */
export async function scanPhaseFolder(
  projectDir: string,
  folderName: string,
  options: { hasHistory: boolean; sequential: boolean },
): Promise<FileEntry[]> {
  const dir = await getDirPath(projectDir, folderName)
  if (!dir) return []

  const entries = await listDirEntries(dir)
  const fileEntries: FileEntry[] = []

  for (const [name, kind] of entries) {
    if (kind !== 'file') continue
    if (!name.endsWith('.md')) continue

    const path = join(dir, name)

    if (options.sequential) {
      fileEntries.push({ kind: 'sequential', name, path, isEditable: true })
    } else if (name === 'current.md') {
      fileEntries.push({ kind: 'current', name, path, isEditable: true })
    } else if (/^\d{4}-\d{2}-\d{2}\.md$/.test(name)) {
      fileEntries.push({ kind: 'history', name, path, isEditable: false })
    }
  }

  fileEntries.sort((a, b) => {
    if (a.kind === 'current') return -1
    if (b.kind === 'current') return 1
    return b.name.localeCompare(a.name)
  })

  return fileEntries
}

/** current.md를 날짜 파일로 아카이브한 뒤 새 내용으로 덮어쓴다 */
export async function archiveAndWrite(
  projectDir: string,
  folderName: string,
  newContent: string,
): Promise<void> {
  const dir = await getOrCreateDir(projectDir, folderName)
  const currentPath = join(dir, 'current.md')

  try {
    const existingContent = await readFile(currentPath)
    if (existingContent.trim()) {
      const datePath = join(dir, `${todayString()}.md`)
      await writeFile(datePath, existingContent)
    }
  } catch {
    // current.md가 없으면 아카이브 스킵
  }

  await writeFile(currentPath, newContent)
}

/** current.md 저장 (아카이브 없이 단순 저장) */
export async function saveCurrentFile(
  projectDir: string,
  folderName: string,
  content: string,
): Promise<void> {
  const dir = await getOrCreateDir(projectDir, folderName)
  await writeFile(join(dir, 'current.md'), content)
}
