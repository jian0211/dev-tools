import type { FileEntry, PhaseStatus, Project } from '../../entities/project'
import { PHASE_FOLDERS, PHASE_GROUPS } from '../../entities/project'
import { AiPanel } from '../../widgets/ai-panel'
import { FileEditor } from '../../widgets/file-editor'
import { FileSidebar } from '../../widgets/file-sidebar'
import { PhaseTabBar } from '../../widgets/phase-tab-bar'
import type { ActiveFile } from '../model/useWorkspace'

type Props = {
  activeProject: Project
  phaseStatus: PhaseStatus
  activePhaseId: string
  folderFiles: Record<string, FileEntry[]>
  activeFolderName: string
  activeFile: ActiveFile | null
  isSaving: boolean
  currentFolders: string[]
  onPhaseChange: (phaseId: string) => void
  onFolderChange: (folderName: string) => void
  onFileChange: (entry: FileEntry, folderName: string) => void
  onContentChange: (value: string) => void
  onSave: () => void
  onArchive: () => void
}

export function WorkspacePage({
  activeProject,
  phaseStatus,
  activePhaseId,
  folderFiles,
  activeFolderName,
  activeFile,
  isSaving,
  currentFolders,
  onPhaseChange,
  onFolderChange,
  onFileChange,
  onContentChange,
  onSave,
  onArchive,
}: Props) {
  return (
    <>
      <PhaseTabBar
        phases={PHASE_GROUPS}
        activePhaseId={activePhaseId}
        phaseStatus={phaseStatus}
        onPhaseChange={onPhaseChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileSidebar
          folders={currentFolders.map((folderName) => {
            const config = PHASE_FOLDERS.find(
              (f) => f.folderName === folderName,
            )
            return {
              folderName,
              label: config?.label ?? folderName,
              hasFiles: (folderFiles[folderName] ?? []).length > 0,
            }
          })}
          activeFolderName={activeFolderName}
          onFolderChange={onFolderChange}
          files={folderFiles[activeFolderName] ?? []}
          activeFileName={activeFile?.entry.name ?? ''}
          onFileChange={(entry) => onFileChange(entry, activeFolderName)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeFile ? (
            <FileEditor
              folderName={activeFile.folderName}
              fileName={activeFile.entry.name}
              content={activeFile.content}
              isEditable={activeFile.entry.isEditable}
              isSaving={isSaving}
              onChange={onContentChange}
              onSave={onSave}
              onArchive={onArchive}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-zinc-300">
              파일을 선택하거나 새로 만드세요
            </div>
          )}
          <AiPanel
            projectName={activeProject.name}
            phaseId={activePhaseId}
            folderName={activeFolderName}
            fileName={activeFile?.entry.name ?? ''}
            fileContent={activeFile?.content ?? ''}
            onApplyContent={(content) => {
              if (activeFile?.entry.isEditable) {
                onContentChange(content)
              }
            }}
          />
        </div>
      </div>
    </>
  )
}
