import { createMilestoneAction } from "@/app/projects/actions";
import { PRIORITIES, STATUSES, type Milestone } from "@/lib/types";
import { formatDate, getDueState, priorityClass, statusClass, toDateInputValue } from "@/lib/utils";

type MilestoneListProps = {
  projectId: string;
  milestones: Milestone[];
  disabled?: boolean;
};

export function MilestoneList({ projectId, milestones, disabled = false }: MilestoneListProps) {
  return (
    <section className="card stack-md">
      <div className="section-header">
        <div>
          <h2>Milestones</h2>
          <p>Track intermediate due dates tied to this project.</p>
        </div>
      </div>

      <div className="stack-sm">
        {milestones.length === 0 ? <p className="muted">No milestones yet.</p> : null}
        {milestones.map((milestone) => {
          const dueState = getDueState(milestone.dueDate, milestone.status);
          return (
            <article key={milestone.id} className={`list-card due-${dueState}`}>
              <div className="list-card-header">
                <strong>{milestone.name}</strong>
                <div className="badge-row">
                  <span className={priorityClass(milestone.priority)}>{milestone.priority}</span>
                  <span className={statusClass(milestone.status)}>{milestone.status}</span>
                </div>
              </div>
              <p className="meta-line">
                Due {formatDate(milestone.dueDate)}{milestone.assignedBy ? ` • Assigned by ${milestone.assignedBy}` : ""}
              </p>
              {milestone.notes ? <p>{milestone.notes}</p> : null}
            </article>
          );
        })}
      </div>

      <form action={createMilestoneAction} className="stack-md form-subsection">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="grid-two">
          <label className="field">
            <span>Milestone name</span>
            <input name="name" required disabled={disabled} />
          </label>
          <label className="field">
            <span>Assigned by</span>
            <input name="assignedBy" disabled={disabled} />
          </label>
        </div>
        <div className="grid-three">
          <label className="field">
            <span>Due date</span>
            <input type="date" name="dueDate" defaultValue={toDateInputValue(null)} disabled={disabled} />
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue="Not Started" disabled={disabled}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Priority</span>
            <select name="priority" defaultValue="Medium" disabled={disabled}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Notes</span>
          <textarea name="notes" rows={3} disabled={disabled} />
        </label>
        <label className="field">
          <span>Completed date</span>
          <input type="date" name="completedDate" disabled={disabled} />
        </label>
        <div className="form-actions">
          <button className="button" type="submit" disabled={disabled}>
            Add milestone
          </button>
        </div>
      </form>
    </section>
  );
}
