import { createProjectUpdateAction } from "@/app/projects/actions";
import { UPDATE_FIELDS, type ProjectUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type UpdateLogProps = {
  projectId: string;
  updates: ProjectUpdate[];
  disabled?: boolean;
};

export function UpdateLog({ projectId, updates, disabled = false }: UpdateLogProps) {
  return (
    <section className="card stack-md">
      <div className="section-header">
        <div>
          <h2>Update history</h2>
          <p>Record what changed, when it changed, and why.</p>
        </div>
      </div>

      <div className="stack-sm">
        {updates.length === 0 ? <p className="muted">No updates logged yet.</p> : null}
        {updates.map((update) => (
          <article key={update.id} className="list-card">
            <div className="list-card-header">
              <strong>{update.updatedField}</strong>
              <span className="muted">{formatDate(update.updateDate)}</span>
            </div>
            <p className="meta-line">
              {update.oldValue ? `From ${update.oldValue}` : "Old value not recorded"}
              {update.newValue ? ` to ${update.newValue}` : ""}
            </p>
            <p>{update.reason}</p>
            {update.enteredBy ? <p className="meta-line">Logged by {update.enteredBy}</p> : null}
          </article>
        ))}
      </div>

      <form action={createProjectUpdateAction} className="stack-md form-subsection">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="grid-two">
          <label className="field">
            <span>Update date</span>
            <input type="date" name="updateDate" disabled={disabled} />
          </label>
          <label className="field">
            <span>Updated field</span>
            <select name="updatedField" defaultValue="Status" disabled={disabled}>
              {UPDATE_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid-two">
          <label className="field">
            <span>Old value</span>
            <input name="oldValue" disabled={disabled} />
          </label>
          <label className="field">
            <span>New value</span>
            <input name="newValue" disabled={disabled} />
          </label>
        </div>
        <label className="field">
          <span>Reason / change note</span>
          <textarea name="reason" rows={3} required disabled={disabled} />
        </label>
        <label className="field">
          <span>Entered by</span>
          <input name="enteredBy" placeholder="Isaac" disabled={disabled} />
        </label>
        <div className="form-actions">
          <button className="button" type="submit" disabled={disabled}>
            Add update
          </button>
        </div>
      </form>
    </section>
  );
}
