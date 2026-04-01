type Props = {
  phaseLabel: string
  fileName: string
  content: string
  onChange: (value: string) => void
}

export function FileEditor({ phaseLabel, fileName, content, onChange }: Props) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-2.5 border-b border-zinc-100 flex items-center gap-2">
        <span className="text-xs font-mono text-zinc-400">{phaseLabel.toLowerCase()}/</span>
        <span className="text-xs font-mono text-zinc-700">{fileName}</span>
      </div>
      <textarea
        className="flex-1 w-full resize-none p-5 text-sm font-mono text-zinc-800 bg-white focus:outline-none leading-relaxed"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </main>
  )
}
