export type Project = {
  name: string
  dirPath: string
}

export type PhaseStatus =
  | 'plan-not-started'
  | 'plan-in-progress'
  | 'design'
  | 'build'
  | 'deliver-ready'
  | 'deliver-done'

export type FileEntryKind = 'current' | 'history' | 'sequential' | 'single'

export type FileEntry = {
  kind: FileEntryKind
  name: string
  path: string
  isEditable: boolean
}

export type PhaseFolderConfig = {
  folderName: string
  hasHistory: boolean
  sequential: boolean
  label: string
}

export const PHASE_FOLDERS: PhaseFolderConfig[] = [
  { folderName: 'meeting', hasHistory: true, sequential: false, label: 'Meeting' },
  { folderName: 'cps', hasHistory: true, sequential: false, label: 'CPS' },
  { folderName: 'prd', hasHistory: true, sequential: false, label: 'PRD' },
  { folderName: 'spec', hasHistory: true, sequential: false, label: 'Spec' },
  { folderName: 'architecture', hasHistory: true, sequential: false, label: 'Architecture' },
  { folderName: 'tasks', hasHistory: false, sequential: true, label: 'Tasks' },
  { folderName: 'self-review', hasHistory: true, sequential: false, label: 'Self Review' },
  { folderName: 'pr', hasHistory: false, sequential: true, label: 'PR' },
]

export type PhaseGroup = {
  id: 'plan' | 'design' | 'build' | 'deliver'
  label: string
  folders: string[]
}

export const PHASE_GROUPS: PhaseGroup[] = [
  { id: 'plan', label: 'Plan', folders: ['meeting', 'cps', 'prd'] },
  { id: 'design', label: 'Design', folders: ['spec', 'architecture', 'tasks'] },
  { id: 'build', label: 'Build', folders: ['self-review'] },
  { id: 'deliver', label: 'Deliver', folders: ['pr'] },
]

export function phaseStatusToGroupId(status: PhaseStatus): PhaseGroup['id'] {
  switch (status) {
    case 'plan-not-started':
    case 'plan-in-progress':
      return 'plan'
    case 'design':
      return 'design'
    case 'build':
      return 'build'
    case 'deliver-ready':
    case 'deliver-done':
      return 'deliver'
  }
}
