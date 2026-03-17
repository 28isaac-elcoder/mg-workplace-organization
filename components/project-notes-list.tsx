"use client";

import { useState } from "react";

import { createProjectNoteAction, deleteProjectNoteAction } from "@/app/projects/actions";
import type { ProjectNote } from "@/lib/types";
import { formatDate, formatDateShort } from "@/lib/utils";

type ProjectNotesInlineProps = {
  projectId: string;
  notes: ProjectNote[];
  disabled?: boolean;
};

/** List of notes + add form only (no card). For use inside overview expandable. */
export function ProjectNotesInline({ projectId, notes, disabled = false }: ProjectNotesInlineProps) {
  const [category, setCategory] = useState<string>("general_note");

  return (
    <>
      <div className="stack-sm">
        {notes.length === 0 ? <p className="muted">No notes yet.</p> : null}
        {notes.map((note) => (
          <article key={note.id} className="list-card">
            <div className="list-card-header">
              <div>
                <strong>{note.title}</strong>
                <span className="muted">
                  {formatDate(note.createdAt)}
                  {note.relevantDate ? ` • Relevant: ${formatDateShort(note.relevantDate)}` : ""}
                  {note.category ? ` • ${note.category.replace(/_/g, " ")}` : ""}
                </span>
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
          <span>Category</span>
          <select
            name="category"
            disabled={disabled}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="general_note">General Note</option>
            <option value="update">Update</option>
            <option value="milestone">Milestone</option>
            <option value="immediate_todo">Immediate To-Do</option>
            <option value="general_todo">General To-Do</option>
            <option value="other">Other</option>
          </select>
        </label>
        {category === "other" ? (
          <label className="field">
            <span>Other category</span>
            <input
              name="otherCategory"
              disabled={disabled}
              placeholder="Enter a custom category"
            />
          </label>
        ) : null}
        <label className="field">
          <span>Relevant date (optional)</span>
          <input type="date" name="relevantDate" disabled={disabled} />
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
