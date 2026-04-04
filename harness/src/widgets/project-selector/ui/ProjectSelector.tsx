import { useState } from 'react'
import type { Project } from '../../../entities/project'
import { createProject, listProjects } from '../../../entities/project'
import { pickRootDirectory } from '../../../shared/lib/fs'

type Props = {
  onProjectSelect: (project: Project) => void
}

export function ProjectSelector({ onProjectSelect }: Props) {
  const [rootHandle, setRootHandle] =
    useState<FileSystemDirectoryHandle | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOpenFolder() {
    try {
      setLoading(true)
      setError(null)
      const root = await pickRootDirectory()
      const found = await listProjects(root)
      setRootHandle(root)
      setProjects(found)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError('폴더를 열 수 없어요.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject() {
    if (!rootHandle || !newProjectName.trim()) return
    try {
      setLoading(true)
      setError(null)
      const project = await createProject(rootHandle, newProjectName.trim())
      onProjectSelect(project)
    } catch {
      setError('프로젝트를 생성할 수 없어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      {/* 로고 */}
      <div className="text-center">
        <div className="text-2xl font-semibold text-white tracking-tight">
          harness
        </div>
        <div className="text-sm text-neutral-500 mt-1">dev workflow</div>
      </div>

      {!rootHandle ? (
        /* 폴더 선택 전 */
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleOpenFolder}
            disabled={loading}
            className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {loading ? '열고 있어요...' : '폴더 열기'}
          </button>
          <p className="text-xs text-neutral-600">
            프로젝트 루트 폴더를 선택하면{' '}
            <code className="text-neutral-400">.harness/</code> 폴더를 자동으로
            관리해요
          </p>
        </div>
      ) : (
        /* 폴더 선택 후 */
        <div className="w-full max-w-sm flex flex-col gap-4">
          {/* 프로젝트 목록 */}
          {projects.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-xs text-neutral-500 mb-1">프로젝트 선택</div>
              {projects.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => onProjectSelect(p)}
                  className="w-full text-left px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg text-sm text-neutral-200 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* 새 프로젝트 생성 */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-neutral-500">새 프로젝트</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                placeholder="seo-improvement"
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 focus:border-neutral-600 rounded-lg text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
              />
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || loading}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm rounded-lg transition-colors disabled:opacity-40"
              >
                생성
              </button>
            </div>
          </div>

          {/* 다시 폴더 선택 */}
          <button
            type="button"
            onClick={handleOpenFolder}
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors text-left"
          >
            다른 폴더 열기 →
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
