import Link from "next/link";

import { getProjects } from "@/lib/projects";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDate, getDueState, priorityClass, statusClass } from "@/lib/utils";

export default async function HomePage() {
  const projects = await getProjects();
  const activeProjects = projects.filter((project) => project.status !== "Completed").length;
  const overdueProjects = projects.filter((project) => {
    if (!project.primaryDueDate || project.status === "Completed" || project.status === "Cancelled") {
      return false;
    }
    return new Date(project.primaryDueDate) < new Date();
  }).length;

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Personal Organizer App</p>
          <h1>Staying Organized at Work</h1>
          <p className="hero-text">
            This app tracks project details, multiple requestors, milestone deadlines, update history,
            related contacts, and required tools from one browser-based workspace.
          </p>
          <div className="hero-actions">
            <Link href="/projects" className="button button-primary">
              Projects Expanded
            </Link>
            <Link href="/projects/new" className="button">
              Add a project
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <h2>Snapshot</h2>
          <dl className="stats-grid">
            <div>
              <dt>Total projects</dt>
              <dd>{projects.length}</dd>
            </div>
            <div>
              <dt>Active</dt>
              <dd>{activeProjects}</dd>
            </div>
            <div>
              <dt>Overdue</dt>
              <dd>{overdueProjects}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{isSupabaseConfigured() ? "Live" : "Demo"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="card projects-table">
        <div className="projects-table-header">
          <span className="projects-table-header-main">Project</span>
          <span>Due</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Requestors</span>
          <span>Tools</span>
          <span>%</span>
        </div>
        <div className="projects-table-body">
          {projects.length === 0 ? (
            <p className="muted">No projects yet. Use “Add a project” to get started.</p>
          ) : (
            projects.map((project) => {
              const dueState = getDueState(project.primaryDueDate, project.status);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/edit`}
                  className={`projects-table-row due-${dueState}`}
                >
                  <div className="projects-table-main">
                    <span className="projects-table-title">{project.title}</span>
                    <span className="projects-table-sub">
                      {project.departmentClient ?? "No department or client set"}
                    </span>
                  </div>
                  <span>{formatDate(project.primaryDueDate)}</span>
                  <span>
                    <span className={priorityClass(project.priority)}>{project.priority}</span>
                  </span>
                  <span>
                    <span className={statusClass(project.status)}>{project.status}</span>
                  </span>
                  <span>{project.requestors.length ? project.requestors.join(", ") : "—"}</span>
                  <span>{project.tools.length ? project.tools.join(", ") : "—"}</span>
                  <span className="projects-table-percent">{project.percentComplete}%</span>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
