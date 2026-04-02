import type { SaveStatus } from '../types'

type Props = {
  projectPath: string | null
  saveStatus: SaveStatus | null
  onOpenFolder: () => void
}

export function Header({ projectPath, saveStatus, onOpenFolder }: Props) {
  const projectName = projectPath ? projectPath.split('/').pop() : null

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight text-zinc-900">harness</span>
        {projectName && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="text-xs font-mono text-zinc-500">{projectName}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {saveStatus && (
          <span className="text-xs text-zinc-400 font-mono">
            {saveStatus === 'saved' && 'saved'}
            {saveStatus === 'saving' && 'saving…'}
            {saveStatus === 'unsaved' && '●'}
          </span>
        )}
        <button
          onClick={onOpenFolder}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          {projectPath ? '폴더 변경' : '폴더 열기'}
        </button>
      </div>
    </header>
  )
}
