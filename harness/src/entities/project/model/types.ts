export type Project = {
  name: string
  dirHandle: FileSystemDirectoryHandle
}

export type PhaseStatus =
  | 'plan-not-started'
  | 'plan-in-progress'
  | 'design'
  | 'build'
  | 'deliver-ready'
  | 'deliver-done'

/**
 * 파일 항목 종류
 * - current  : current.md — 편집 가능한 최신본
 * - history  : YYYY-MM-DD.md — 읽기 전용 히스토리
 * - sequential: task-001.md, pr-YYYY-MM-DD.md — current 없는 순차 파일
 * - single   : retro.md — 프로젝트당 하나짜리 파일
 */
export type FileEntryKind = 'current' | 'history' | 'sequential' | 'single'

export type FileEntry = {
  kind: FileEntryKind
  name: string
  handle: FileSystemFileHandle
  isEditable: boolean
}

export type FolderContent = {
  folderName: string
  files: FileEntry[]
}

/**
 * 각 phase 폴더의 설정
 * - hasHistory: current + 날짜 히스토리 관리 여부
 * - sequential: current 없이 순차 파일만 존재 여부
 */
export type PhaseFolderConfig = {
  folderName: string
  hasHistory: boolean
  sequential: boolean
  label: string
}

export const PHASE_FOLDERS: PhaseFolderConfig[] = [
  {
    folderName: 'meeting',
    hasHistory: true,
    sequential: false,
    label: 'Meeting',
  },
  { folderName: 'cps', hasHistory: true, sequential: false, label: 'CPS' },
  { folderName: 'prd', hasHistory: true, sequential: false, label: 'PRD' },
  { folderName: 'spec', hasHistory: true, sequential: false, label: 'Spec' },
  {
    folderName: 'architecture',
    hasHistory: true,
    sequential: false,
    label: 'Architecture',
  },
  { folderName: 'tasks', hasHistory: false, sequential: true, label: 'Tasks' },
  {
    folderName: 'self-review',
    hasHistory: true,
    sequential: false,
    label: 'Self Review',
  },
  { folderName: 'pr', hasHistory: false, sequential: true, label: 'PR' },
]

/** phase 단계별 표시되는 폴더 묶음 */
export type PhaseGroup = {
  id: 'plan' | 'design' | 'build' | 'deliver'
  label: string
  folders: string[] // folderName 목록
}

export const PHASE_GROUPS: PhaseGroup[] = [
  { id: 'plan', label: 'Plan', folders: ['meeting', 'cps', 'prd'] },
  { id: 'design', label: 'Design', folders: ['spec', 'architecture', 'tasks'] },
  { id: 'build', label: 'Build', folders: ['self-review'] },
  { id: 'deliver', label: 'Deliver', folders: ['pr'] },
]
