/**
 * Node.js fs/promises 기반 파일 시스템 래퍼
 * 브라우저 File System Access API를 대체
 */
import { mkdir, readdir, readFile as fsReadFile, stat, writeFile as fsWriteFile } from 'node:fs/promises'
import { join } from 'node:path'

/** 디렉토리 내 모든 항목을 [name, kind] 배열로 반환 */
export async function listDirEntries(
  dirPath: string,
): Promise<[string, 'file' | 'directory'][]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    return entries.map((e) => [
      e.name,
      e.isDirectory() ? 'directory' : 'file',
    ])
  } catch (_e: unknown) {
    return []
  }
}

/** 서브디렉토리 경로 반환. 없으면 null. */
export async function getDirPath(
  parent: string,
  name: string,
): Promise<string | null> {
  const p = join(parent, name)
  try {
    const s = await stat(p)
    return s.isDirectory() ? p : null
  } catch {
    return null
  }
}

/** 서브디렉토리 경로 반환. 없으면 생성. */
export async function getOrCreateDir(
  parent: string,
  name: string,
): Promise<string> {
  const p = join(parent, name)
  await mkdir(p, { recursive: true })
  return p
}

/** 파일 경로 반환. 없으면 null. */
export async function getFilePath(
  dir: string,
  name: string,
): Promise<string | null> {
  const p = join(dir, name)
  try {
    const s = await stat(p)
    return s.isFile() ? p : null
  } catch {
    return null
  }
}

/** 파일 텍스트 읽기 */
export async function readFile(filePath: string): Promise<string> {
  return await fsReadFile(filePath, 'utf-8')
}

/** 파일 텍스트 쓰기 (없으면 생성) */
export async function writeFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fsWriteFile(filePath, content, 'utf-8')
}

/** 디렉토리 존재 확인 */
export async function dirExists(
  parent: string,
  name: string,
): Promise<boolean> {
  return (await getDirPath(parent, name)) !== null
}

/** 파일 존재 확인 */
export async function fileExists(
  dir: string,
  name: string,
): Promise<boolean> {
  return (await getFilePath(dir, name)) !== null
}
