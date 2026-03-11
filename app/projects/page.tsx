import Link from "next/link";

import { PRIORITIES, STATUSES } from "@/lib/types";
import { getProjects } from "@/lib/projects";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDate, getDueState, priorityClass, statusClass } from "@/lib/utils";

type ProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = {
    status: typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : undefined,
    priority: typeof resolvedSearchParams.priority === "string" ? resolvedSearchParams.priority : undefined,
    requestor: typeof resolvedSearchParams.requestor === "string" ? resolvedSearchParams.requestor : undefined,
    query: typeof resolvedSearchParams.query === "string" ? resolvedSearchParams.query : undefined,
  };
  const message = typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : "";

  const projects = await getProjects(filters);
  const requestorOptions = Array.from(new Set(projects.flatMap((project) => project.requestors))).sort();

  return (
    <div className="stack-xl">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Project tracker</h1>
          <p className="muted">
            Filter by status, priority, requestor, or search text to focus on the work that matters today.
          </p>
        </div>
        <div className="card-actions">
          <Link href="/" className="button">
            Project List
          </Link>
          <Link href="/projects/new" className="button button-primary">
            New project
          </Link>
        </div>
      </section>

      {!isSupabaseConfigured() ? (
        <section className="card notice-card">
          <p>
            Demo mode is active. You can browse sample records now, and real saving will turn on once
            Supabase variables are configured.
          </p>
        </section>
      ) : null}

      {message ? (
        <section className="card notice-card">
          <p>{message}</p>
        </section>
      ) : null}

      <section className="card filters-section">
        <form className="filters-grid" action="/projects">
          <div className="filter-actions">
            <button className="button button-primary" type="submit">
              Apply filters
            </button>
            <Link href="/projects" className="button">
              Clear
            </Link>
          </div>

          <label className="field">
            <span>Search</span>
            <input name="query" defaultValue={filters.query ?? ""} placeholder="Project, client, tool..." />
          </label>

          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={filters.status ?? "All"}>
              <option value="All">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Priority</span>
            <select name="priority" defaultValue={filters.priority ?? "All"}>
              <option value="All">All</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Requestor</span>
            <select name="requestor" defaultValue={filters.requestor ?? "All"}>
              <option value="All">All</option>
              {requestorOptions.map((requestor) => (
                <option key={requestor} value={requestor}>
                  {requestor}
                </option>
              ))}
            </select>
          </label>
        </form>
      </section>

      <section className="projects-grid">
        {projects.length === 0 ? (
          <div className="card">
            <h2>No projects found</h2>
            <p>Try clearing filters or create a new project.</p>
          </div>
        ) : null}

        {projects.map((project) => {
          const dueState = getDueState(project.primaryDueDate, project.status);
          return (
            <article key={project.id} className={`card project-card due-${dueState}`}>
              <div className="project-card-top">
                <div>
                  <h2>{project.title}</h2>
                  <p className="muted">{project.departmentClient ?? "No department or client set"}</p>
                </div>
                <div className="badge-row">
                  <span className={priorityClass(project.priority)}>{project.priority}</span>
                  <span className={statusClass(project.status)}>{project.status}</span>
                </div>
              </div>

              <p className="meta-line">
                Due {formatDate(project.primaryDueDate)} • Last updated {formatDate(project.lastUpdateDate)}
              </p>
              <p className="muted">
                Requestors: {project.requestors.length > 0 ? project.requestors.join(", ") : "None"} • Tools:{" "}
                {project.tools.length > 0 ? project.tools.join(", ") : "None"}
              </p>
              <div className="progress-row">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${project.percentComplete}%` }} />
                </div>
                <span>{project.percentComplete}% complete</span>
              </div>
              <p>{project.nextAction ?? "No next action recorded."}</p>
              <div className="card-actions">
                <Link href={`/projects/${project.id}/edit`} className="button button-primary">
                  Open
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
