import Link from "next/link";

import { updateProjectAction } from "@/app/projects/actions";
import { ContactList } from "@/components/contact-list";
import { MilestoneList } from "@/components/milestone-list";
import { ProjectForm } from "@/components/project-form";
import { ProjectNotesInline } from "@/components/project-notes-list";
import { UpdateLog } from "@/components/update-log";
import { getProjectById } from "@/lib/projects";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatDate, getDueState, priorityClass, statusClass } from "@/lib/utils";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  const dueState = getDueState(project.primaryDueDate, project.status);
  const disabled = !isSupabaseConfigured();

  return (
    <div className="stack-xl">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Edit project</p>
          <h1>{project.title}</h1>
          <p className="muted">Update core project details, requestors, tools, and completion status.</p>
        </div>
        <div className="card-actions">
          <Link href="/" className="button">
            Projects List
          </Link>
          <Link href="/projects" className="button">
            Projects Expanded
          </Link>
        </div>
      </section>

      {!isSupabaseConfigured() ? (
        <section className="card notice-card">
          <p>This form is visible for review, but changes will not save until Supabase is configured.</p>
        </section>
      ) : null}

      <section className={`card hero-panel due-${dueState}`}>
        <div className="hero-panel-top">
          <div>
            <p className="eyebrow">Project overview</p>
            <h2>{project.title}</h2>
            <p className="muted">
              {project.departmentClient ?? "No department or client set"} • Owner {project.owner ?? "Not assigned"}
            </p>
          </div>
          <div className="badge-row">
            <span className={priorityClass(project.priority)}>{project.priority}</span>
            <span className={statusClass(project.status)}>{project.status}</span>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <span className="detail-label">Assigned</span>
            <strong>{formatDate(project.assignedDate)}</strong>
          </div>
          <div>
            <span className="detail-label">Last updated</span>
            <strong>{formatDate(project.lastUpdateDate)}</strong>
          </div>
          <div>
            <span className="detail-label">Primary due date</span>
            <strong>{formatDate(project.primaryDueDate)}</strong>
          </div>
          <div>
            <span className="detail-label">Completion</span>
            <strong>{project.percentComplete}%</strong>
          </div>
        </div>

        <details className="notes-expandable">
          <summary className="notes-summary">
            <strong>Notes:</strong>{" "}
            {project.projectNotes.length > 0 ? (
              <>
                {project.projectNotes[0].title}
                {project.projectNotes[0].content ? ` – ${project.projectNotes[0].content}` : ""}
              </>
            ) : (
              "No notes recorded."
            )}
          </summary>
          <div className="notes-expandable-content">
            <ProjectNotesInline projectId={project.id} notes={project.projectNotes} disabled={disabled} />
          </div>
        </details>
      </section>

      <section className="card">
        <h2>Edit project</h2>
        <ProjectForm action={updateProjectAction} project={project} submitLabel="Save changes" />
      </section>

      {disabled ? (
        <section className="card notice-card">
          <p>Demo mode is active. Add your Supabase variables to enable saving from the forms below.</p>
        </section>
      ) : null}

      <div className="detail-layout">
        <MilestoneList projectId={project.id} milestones={project.milestones} disabled={disabled} />
        <UpdateLog projectId={project.id} updates={project.updates} disabled={disabled} />
      </div>

      <ContactList projectId={project.id} contacts={project.contacts} disabled={disabled} />
    </div>
  );
}
