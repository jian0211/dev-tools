type Props = {
  projectName?: string
}

export function Header({ projectName }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          harness
        </span>
        {projectName && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="text-sm text-zinc-500 font-mono">
              {projectName}
            </span>
          </>
        )}
      </div>
      <span className="text-xs text-zinc-400 font-mono">dev workflow</span>
    </header>
  )
}
