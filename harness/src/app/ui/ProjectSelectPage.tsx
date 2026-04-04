import type { Project } from '../../entities/project'
import { ProjectSelector } from '../../widgets/project-selector'

type Props = {
  onProjectSelect: (project: Project) => void
}

export function ProjectSelectPage({ onProjectSelect }: Props) {
  return <ProjectSelector onProjectSelect={onProjectSelect} />
}
