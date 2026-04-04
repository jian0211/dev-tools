type Props = {
  folderName: string
  fileName: string
  content: string
  isEditable: boolean
  isSaving?: boolean
  onChange: (value: string) => void
  onSave: () => void
  onArchive: () => void
}

export function FileEditor({
  folderName,
  fileName,
  content,
  isEditable,
  isSaving = false,
  onChange,
  onSave,
  onArchive,
}: Props) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-2.5 border-b border-zinc-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-zinc-400">{folderName}/</span>
          <span className="text-xs font-mono text-zinc-700">{fileName}</span>
          {!isEditable && (
            <span className="ml-2 text-xs text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">읽기 전용</span>
          )}
        </div>

        {isEditable && (
          <div className="flex items-center gap-2">
            <button
              onClick={onArchive}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-1 rounded hover:bg-zinc-100"
              title="현재 내용을 날짜 파일로 보관하고 저장"
            >
              아카이브 & 저장
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="text-xs bg-zinc-800 text-white hover:bg-zinc-700 transition-colors px-3 py-1 rounded disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>

      {/* 에디터 */}
      <textarea
        className="flex-1 w-full resize-none p-5 text-sm font-mono text-zinc-800 bg-white focus:outline-none leading-relaxed disabled:bg-zinc-50 disabled:text-zinc-400"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        disabled={!isEditable}
        placeholder={isEditable ? '내용을 입력하세요...' : ''}
      />
    </main>
  )
}
