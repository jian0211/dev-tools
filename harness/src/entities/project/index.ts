export type { Project, PhaseStatus, FileEntry, FolderContent, PhaseFolderConfig, PhaseGroup } from './model/types'
export { PHASE_FOLDERS, PHASE_GROUPS } from './model/types'
export {
  listProjects,
  createProject,
  detectPhase,
  scanPhaseFolder,
  archiveAndWrite,
  readCurrentFile,
  saveCurrentFile,
  loadFolderContent,
} from './model/projectFs'
