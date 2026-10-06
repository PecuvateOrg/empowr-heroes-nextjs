import Link from 'next/link'
import ProjectProgress from '@/components/ProjectProgress'
import { PROJECTS, type ProjectKey } from '@/lib/projects'

// One project's list card. Shared by /projects and the homepage.
export default function ProjectCard({ projectKey, raised }: { projectKey: ProjectKey; raised: number }) {
  const project = PROJECTS[projectKey]
  return (
    <div className="tc">
      <div className="tc-emoji">{project.emoji}</div>
      <div className="tc-name">{project.name}</div>
      <div className="tc-desc">{project.tagline}</div>

      <ProjectProgress raised={raised} goal={project.goalAmount} />

      <div className="tc-btns">
        <Link href={`/projects/${projectKey}`} className="tca tca-main">Support This Project</Link>
      </div>
    </div>
  )
}
