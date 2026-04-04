import { useState, useEffect } from 'react'
import type { Project } from '../model/types.js'
import { listProjects, createProject } from '../model/projectFs.js'

/** 프로젝트 목록 로드 + 생성만 담당 */
export function useProjects(rootPath: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  function refresh() {
    listProjects(rootPath)
      .then((p) => { setProjects(p); setLoaded(true) })
      .catch((e) => setError(String(e)))
  }

  useEffect(() => { refresh() }, [rootPath])

  async function create(name: string): Promise<Project> {
    const p = await createProject(rootPath, name.trim())
    refresh()
    return p
  }

  return { projects, loaded, error, create }
}
