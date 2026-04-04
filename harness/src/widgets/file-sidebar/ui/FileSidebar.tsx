import type { FileEntry } from '../../../entities/project'

type Props = {
  folderName: string
  files: FileEntry[]
  activeFileName: string
  onFileChange: (entry: FileEntry) => void
}

export function FileSidebar({ folderName, files, activeFileName, onFileChange }: Props) {
  const currentFiles = files.filter((f) => f.kind === 'current' || f.kind === 'sequential' || f.kind === 'single')
  const historyFiles = files.filter((f) => f.kind === 'history')

  return (
    <aside className="w-44 shrink-0 border-r border-zinc-200 bg-zinc-50 py-3 overflow-y-auto flex flex-col">
      {/* 폴더명 */}
      <div className="px-4 pb-2 text-xs text-zinc-400 font-mono">{folderName}/</div>

      {/* 현재 파일 목록 */}
      <ul>
        {currentFiles.map((file) => {
          const isActive = file.name === activeFileName
          return (
            <li key={file.name}>
              <button
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
          <div className="px-4 pt-3 pb-1 text-xs text-zinc-300 font-mono">history</div>
          <ul>
            {historyFiles.map((file) => {
              const isActive = file.name === activeFileName
              return (
                <li key={file.name}>
                  <button
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
    </aside>
  )
}
