"use client";

import { useCallback, useState, useTransition } from "react";

import { autosaveProjectAction } from "@/app/projects/actions";
import { PRIORITIES, STATUSES, type ProjectDetail } from "@/lib/types";
import { toDateInputValue } from "@/lib/utils";

type EditProjectAutosaveFormProps = {
  project: ProjectDetail;
  disabled: boolean;
};

type ProjectFormValues = {
  projectId: string;
  title: string;
  owner: string;
  summary: string;
  assignedDate: string;
  lastUpdateDate: string;
  primaryDueDate: string;
  priority: string;
  status: string;
  percentComplete: string;
  completedDate: string;
  departmentClient: string;
  requestors: string;
  tools: string;
  nextAction: string;
};

export function EditProjectAutosaveForm({ project, disabled }: EditProjectAutosaveFormProps) {
  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState<ProjectFormValues>({
    projectId: project.id,
    title: project.title ?? "",
    owner: project.owner ?? "",
    summary: project.summary ?? "",
    assignedDate: toDateInputValue(project.assignedDate),
    lastUpdateDate: toDateInputValue(project.lastUpdateDate),
    primaryDueDate: toDateInputValue(project.primaryDueDate),
    priority: project.priority ?? "Medium",
    status: project.status ?? "Not Started",
    percentComplete: String(project.percentComplete ?? 0),
    completedDate: toDateInputValue(project.completedDate),
    departmentClient: project.departmentClient ?? "",
    requestors: project.requestors.join(", "),
    tools: project.tools.join(", "),
    nextAction: project.nextAction ?? "",
  });

  const setField = useCallback((name: keyof ProjectFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const autosave = useCallback(() => {
    if (disabled) return;
    const formData = new FormData();
    (Object.entries(values) as Array<[keyof ProjectFormValues, string]>).forEach(([key, value]) => {
      formData.append(key, value);
    });
    startTransition(() => {
      void autosaveProjectAction(formData);
    });
  }, [disabled, values]);

  const handleChange =
    (name: keyof ProjectFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setField(name, event.target.value);
    };

  const handleBlur =
    (name: keyof ProjectFormValues) =>
    (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setField(name, event.target.value);
      autosave();
    };

  return (
    <form className="stack-lg" onSubmit={(event) => event.preventDefault()}>
      <div className="form-actions">
        <span className="muted" aria-live="polite">
          {disabled ? "Saving is disabled (demo mode)." : isPending ? "Saving changes…" : "Changes save automatically."}
        </span>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Project title</span>
          <input
            name="title"
            value={values.title}
            required
            disabled={disabled}
            onChange={handleChange("title")}
            onBlur={handleBlur("title")}
          />
        </label>

        <label className="field">
          <span>Owner</span>
          <input
            name="owner"
            value={values.owner}
            placeholder="Isaac"
            disabled={disabled}
            onChange={handleChange("owner")}
            onBlur={handleBlur("owner")}
          />
        </label>
      </div>

      <label className="field">
        <span>Summary</span>
        <textarea
          name="summary"
          rows={3}
          value={values.summary}
          placeholder="Short project summary"
          disabled={disabled}
          onChange={handleChange("summary")}
          onBlur={handleBlur("summary")}
        />
      </label>

      <div className="grid-three">
        <label className="field">
          <span>Assigned date</span>
          <input
            type="date"
            name="assignedDate"
            value={values.assignedDate}
            disabled={disabled}
            onChange={handleChange("assignedDate")}
            onBlur={handleBlur("assignedDate")}
          />
        </label>
        <label className="field">
          <span>Last update date</span>
          <input
            type="date"
            name="lastUpdateDate"
            value={values.lastUpdateDate}
            disabled={disabled}
            onChange={handleChange("lastUpdateDate")}
            onBlur={handleBlur("lastUpdateDate")}
          />
        </label>
        <label className="field">
          <span>Primary due date</span>
          <input
            type="date"
            name="primaryDueDate"
            value={values.primaryDueDate}
            disabled={disabled}
            onChange={handleChange("primaryDueDate")}
            onBlur={handleBlur("primaryDueDate")}
          />
        </label>
      </div>

      <div className="grid-three">
        <label className="field">
          <span>Priority</span>
          <select
            name="priority"
            value={values.priority}
            disabled={disabled}
            onChange={handleChange("priority")}
            onBlur={handleBlur("priority")}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select
            name="status"
            value={values.status}
            disabled={disabled}
            onChange={handleChange("status")}
            onBlur={handleBlur("status")}
          >
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
            value={values.percentComplete}
            disabled={disabled}
            onChange={handleChange("percentComplete")}
            onBlur={handleBlur("percentComplete")}
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Completed date</span>
          <input
            type="date"
            name="completedDate"
            value={values.completedDate}
            disabled={disabled}
            onChange={handleChange("completedDate")}
            onBlur={handleBlur("completedDate")}
          />
        </label>
        <label className="field">
          <span>Department / client</span>
          <input
            name="departmentClient"
            value={values.departmentClient}
            placeholder="Client or internal team"
            disabled={disabled}
            onChange={handleChange("departmentClient")}
            onBlur={handleBlur("departmentClient")}
          />
        </label>
      </div>

      <div className="grid-two">
        <label className="field">
          <span>Requestors</span>
          <input
            name="requestors"
            value={values.requestors}
            placeholder="Enter names, comma-separated"
            disabled={disabled}
            onChange={handleChange("requestors")}
            onBlur={handleBlur("requestors")}
          />
        </label>
        <label className="field">
          <span>Required software / tools</span>
          <input
            name="tools"
            value={values.tools}
            placeholder="Enter tools or software, comma-separated"
            disabled={disabled}
            onChange={handleChange("tools")}
            onBlur={handleBlur("tools")}
          />
        </label>
      </div>

      <label className="field">
        <span>Next action</span>
        <input
          name="nextAction"
          value={values.nextAction}
          placeholder="Immediate next step"
          disabled={disabled}
          onChange={handleChange("nextAction")}
          onBlur={handleBlur("nextAction")}
        />
      </label>
    </form>
  );
}

