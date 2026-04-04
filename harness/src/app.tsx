#!/usr/bin/env node
import { render } from 'ink'
import { useState } from 'react'
import { resolve } from 'node:path'
import type { Project } from './model/types.js'
import { useProjects } from './hooks/useProjects.js'
import { LoadingView } from './components/LoadingView.js'
import { ErrorView } from './components/ErrorView.js'
import { ProjectSelectPage } from './pages/ProjectSelectPage.js'
import { WorkspacePage } from './pages/WorkspacePage.js'

const rootPath = resolve(process.argv[2] || '.')

function App() {
  const { projects, loaded, error, create } = useProjects(rootPath)
  const [project, setProject] = useState<Project | null>(null)

  if (error) return <ErrorView message={error} />
  if (!loaded) return <LoadingView />
  if (!project) {
    return (
      <ProjectSelectPage
        rootPath={rootPath}
        projects={projects}
        onSelect={setProject}
        onCreate={create}
      />
    )
  }

  return <WorkspacePage project={project} />
}

render(<App />)
