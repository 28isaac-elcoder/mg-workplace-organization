import type { ProjectDetail } from "@/lib/types";
import { PRIORITIES, STATUSES } from "@/lib/types";
import { toDateInputValue } from "@/lib/utils";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  project?: ProjectDetail;
  submitLabel: string;
};

export function ProjectForm({ action, project, submitLabel }: ProjectFormProps) {
  return (
    <form action={action} className="stack-lg">
      {project ? <input type="hidden" name="projectId" value={project.id} /> : null}

      <div className="grid-two">
        <label className="field">
          <span>Project title</span>
          <input name="title" defaultValue={project?.title ?? ""} required />
        </label>

        <label className="field">
          <span>Owner</span>
          <input name="owner" defaultValue={project?.owner ?? ""} placeholder="Isaac" />
        </label>
      </div>

      <label className="field">
        <span>Summary</span>
        <textarea
          name="summary"
          rows={3}
          defaultValue={project?.summary ?? ""}
          placeholder="Short project summary"
        />
      </label>

      <div className="grid-three">
        <label className="field">
          <span>Assigned date</span>
          <input type="date" name="assignedDate" defaultValue={toDateInputValue(project?.assignedDate)} />
        </label>
        <label className="field">
          <span>Last update date</span>
          <input
            type="date"
            name="lastUpdateDate"
            defaultValue={toDateInputValue(project?.lastUpdateDate)}
          />
        </label>
        <label className="field">
          <span>Primary due date</span>
          <input
            type="date"
            name="primaryDueDate"
            defaultValue={toDateInputValue(project?.primaryDueDate)}
          />
        </label>
      </div>

      <div className="grid-three">
        <label className="field">
          <span>Priority</span>
          <select name="priority" defaultValue={project?.priority ?? "Medium"}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={project?.status ?? "Not Started"}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Percent complete</span>
          <input
            type="number"
            name="percentComplete"
            min={0}
            max={100}
            defaultValue={project?.percentComplete ?? 0}
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Completed date</span>
          <input
            type="date"
            name="completedDate"
            defaultValue={toDateInputValue(project?.completedDate)}
          />
        </label>
        <label className="field">
          <span>Department / client</span>
          <input
            name="departmentClient"
            defaultValue={project?.departmentClient ?? ""}
            placeholder="Client or internal team"
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Requestors</span>
          <input
            name="requestors"
            defaultValue={project?.requestors.join(", ") ?? ""}
            placeholder="Enter names, comma-separated"
          />
        </label>
        <label className="field">
          <span>Required software / tools</span>
          <input
            name="tools"
            defaultValue={project?.tools.join(", ") ?? ""}
            placeholder="Enter tools or software, comma-separated"
          />
        </label>
      </div>

      <label className="field">
        <span>Next action</span>
        <input
          name="nextAction"
          defaultValue={project?.nextAction ?? ""}
          placeholder="Immediate next step"
        />
      </label>

      <div className="form-actions">
        <button className="button button-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
