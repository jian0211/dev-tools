import { Header } from '../shared/ui/Header'
import { useWorkspace } from './model/useWorkspace'
import { ProjectSelectPage } from './ui/ProjectSelectPage'
import { WorkspacePage } from './ui/WorkspacePage'

export function App() {
  const ws = useWorkspace()

  return (
    <div className="h-screen flex flex-col bg-white text-zinc-900 font-sans">
      <Header projectName={ws.activeProject?.name} />

      {!ws.activeProject ? (
        <ProjectSelectPage onProjectSelect={ws.handleProjectSelect} />
      ) : (
        <WorkspacePage
          activeProject={ws.activeProject}
          phaseStatus={ws.phaseStatus}
          activePhaseId={ws.activePhaseId}
          folderFiles={ws.folderFiles}
          activeFolderName={ws.activeFolderName}
          activeFile={ws.activeFile}
          isSaving={ws.isSaving}
          currentFolders={ws.currentFolders}
          onPhaseChange={ws.handlePhaseChange}
          onFolderChange={ws.handleFolderChange}
          onFileChange={ws.selectFile}
          onContentChange={ws.handleContentChange}
          onSave={ws.handleSave}
          onArchive={ws.handleArchive}
        />
      )}
    </div>
  )
}
