import type { FileItem } from '../../../entities/phase'

type Props = {
  files: FileItem[]
  activeFileId: string
  onFileChange: (fileId: string) => void
}

export function FileSidebar({ files, activeFileId, onFileChange }: Props) {
  return (
    <aside className="w-44 shrink-0 border-r border-zinc-200 bg-zinc-50 py-3 overflow-y-auto">
      <ul>
        {files.map((file) => {
          const isActive = file.id === activeFileId
          return (
            <li key={file.id}>
              <button
                onClick={() => onFileChange(file.id)}
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
    </aside>
  )
}
