/**
 * File System Access API 래퍼
 * React/상태 의존 없음. 순수 FS 유틸 함수만 포함.
 */

/** 사용자에게 폴더 선택 다이얼로그를 띄우고 핸들 반환 */
export async function pickRootDirectory(): Promise<FileSystemDirectoryHandle> {
  return await window.showDirectoryPicker({ mode: 'readwrite' })
}

/** 디렉토리 내 모든 항목을 [name, handle] 배열로 반환 */
export async function listDirEntries(
  dir: FileSystemDirectoryHandle
): Promise<[string, FileSystemHandle][]> {
  const entries: [string, FileSystemHandle][] = []
  for await (const [name, handle] of dir) {
    entries.push([name, handle])
  }
  return entries
}

/** 디렉토리 핸들에서 서브디렉토리 핸들 반환. 없으면 null. */
export async function getDirHandle(
  parent: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await parent.getDirectoryHandle(name)
  } catch {
    return null
  }
}

/** 디렉토리 핸들에서 서브디렉토리 핸들 반환. 없으면 생성. */
export async function getOrCreateDir(
  parent: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemDirectoryHandle> {
  return await parent.getDirectoryHandle(name, { create: true })
}

/** 파일 핸들 반환. 없으면 null. */
export async function getFileHandle(
  dir: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemFileHandle | null> {
  try {
    return await dir.getFileHandle(name)
  } catch {
    return null
  }
}

/** 파일 핸들 반환. 없으면 생성. */
export async function getOrCreateFile(
  dir: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemFileHandle> {
  return await dir.getFileHandle(name, { create: true })
}

/** 파일 핸들로 텍스트 읽기 */
export async function readFile(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile()
  return await file.text()
}

/** 파일 핸들로 텍스트 쓰기 */
export async function writeFile(
  handle: FileSystemFileHandle,
  content: string
): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

/** 디렉토리가 존재하는지 확인 */
export async function dirExists(
  parent: FileSystemDirectoryHandle,
  name: string
): Promise<boolean> {
  return (await getDirHandle(parent, name)) !== null
}

/** 파일이 존재하는지 확인 */
export async function fileExists(
  dir: FileSystemDirectoryHandle,
  name: string
): Promise<boolean> {
  return (await getFileHandle(dir, name)) !== null
}
