import type { FileEntry } from '../../../entities/project'

type FolderInfo = {
  folderName: string
  label: string
  hasFiles: boolean
}

type Props = {
  folders: FolderInfo[]
  activeFolderName: string
  onFolderChange: (folderName: string) => void
  files: FileEntry[]
  activeFileName: string
  onFileChange: (entry: FileEntry) => void
}

export function FileSidebar({
  folders,
  activeFolderName,
  onFolderChange,
  files,
  activeFileName,
  onFileChange,
}: Props) {
  const currentFiles = files.filter(
    (f) =>
      f.kind === 'current' || f.kind === 'sequential' || f.kind === 'single',
  )
  const historyFiles = files.filter((f) => f.kind === 'history')

  return (
    <div className="flex flex-col w-44 shrink-0 border-r border-zinc-200 bg-zinc-50">
      {/* 폴더 탭 */}
      <div className="border-b border-zinc-200">
        {folders.map((folder) => {
          const isActive = folder.folderName === activeFolderName
          return (
            <button
              type="button"
              key={folder.folderName}
              onClick={() => onFolderChange(folder.folderName)}
              className={[
                'w-full text-left px-4 py-2.5 text-xs font-mono transition-colors flex items-center justify-between',
                isActive
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50',
              ].join(' ')}
            >
              <span>{folder.label}</span>
              {folder.hasFiles && (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              )}
            </button>
          )
        })}
      </div>

      {/* 파일 사이드바 */}
      <div className="py-3 overflow-y-auto flex-1 flex flex-col">
        {/* 폴더명 */}
        <div className="px-4 pb-2 text-xs text-zinc-400 font-mono">
          {activeFolderName}/
        </div>

        {/* 현재 파일 목록 */}
        <ul>
          {currentFiles.map((file) => {
            const isActive = file.name === activeFileName
            return (
              <li key={file.name}>
                <button
                  type="button"
                  onClick={() => onFileChange(file)}
                  className={[
                    'w-full text-left px-4 py-2 text-xs font-mono transition-colors cursor-pointer',
                    isActive
                      ? 'bg-zinc-200 text-zinc-900 font-semibold'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800',
                  ].join(' ')}
                >
                  {file.name}
                </button>
              </li>
            )
          })}
        </ul>

        {/* 히스토리 */}
        {historyFiles.length > 0 && (
          <>
            <div className="px-4 pt-3 pb-1 text-xs text-zinc-300 font-mono">
              history
            </div>
            <ul>
              {historyFiles.map((file) => {
                const isActive = file.name === activeFileName
                return (
                  <li key={file.name}>
                    <button
                      type="button"
                      onClick={() => onFileChange(file)}
                      className={[
                        'w-full text-left px-4 py-1.5 text-xs font-mono transition-colors cursor-pointer',
                        isActive
                          ? 'bg-zinc-200 text-zinc-500 font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500',
                      ].join(' ')}
                    >
                      {file.name.replace('.md', '')}
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
