/**
 * File System Access API 타입 선언
 * TypeScript DOM lib에 아직 포함되지 않은 타입들을 보완
 */

interface FileSystemDirectoryHandle {
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
  keys(): AsyncIterableIterator<string>
  values(): AsyncIterableIterator<FileSystemHandle>
}

interface Window {
  showDirectoryPicker(options?: {
    mode?: 'read' | 'readwrite'
  }): Promise<FileSystemDirectoryHandle>
  showOpenFilePicker(options?: object): Promise<FileSystemFileHandle[]>
  showSaveFilePicker(options?: object): Promise<FileSystemFileHandle>
}
