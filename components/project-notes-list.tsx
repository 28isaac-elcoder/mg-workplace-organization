import { createProjectNoteAction, deleteProjectNoteAction } from "@/app/projects/actions";
import type { ProjectNote } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type ProjectNotesInlineProps = {
  projectId: string;
  notes: ProjectNote[];
  disabled?: boolean;
};

/** List of notes + add form only (no card). For use inside overview expandable. */
export function ProjectNotesInline({ projectId, notes, disabled = false }: ProjectNotesInlineProps) {
  return (
    <>
      <div className="stack-sm">
        {notes.length === 0 ? <p className="muted">No notes yet.</p> : null}
        {notes.map((note) => (
          <article key={note.id} className="list-card">
            <div className="list-card-header">
              <div>
                <strong>{note.title}</strong>
                <span className="muted">{formatDate(note.createdAt)}</span>
              </div>
              <form action={deleteProjectNoteAction} className="list-card-action">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="noteId" value={note.id} />
                <button type="submit" className="button button-ghost button-sm" disabled={disabled} aria-label={`Delete note: ${note.title}`}>
                  Delete
                </button>
              </form>
            </div>
            {note.content ? <p>{note.content}</p> : null}
          </article>
        ))}
      </div>

      <form action={createProjectNoteAction} className="stack-md form-subsection">
        <input type="hidden" name="projectId" value={projectId} />
        <label className="field">
          <span>Note title</span>
          <input name="title" required disabled={disabled} placeholder="e.g. Scope change, Meeting summary" />
        </label>
        <label className="field">
          <span>Content</span>
          <textarea name="content" rows={4} disabled={disabled} placeholder="Note content…" />
        </label>
        <div className="form-actions">
          <button className="button" type="submit" disabled={disabled}>
            Add note
          </button>
        </div>
      </form>
    </>
  );
}
