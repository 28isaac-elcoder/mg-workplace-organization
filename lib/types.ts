export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const STATUSES = [
  "Not Started",
  "In Progress",
  "Waiting",
  "Completed",
  "On Hold",
  "Cancelled",
] as const;
export const CONTACT_ROLES = [
  "Requestor",
  "Decision Maker",
  "Reviewer",
  "Client Contact",
  "Internal Contact",
] as const;
export const UPDATE_FIELDS = [
  "Assigned Date",
  "Last Update Date",
  "Primary Due Date",
  "Status",
  "Priority",
  "Owner",
  "Scope",
  "Summary",
  "Next Action",
] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];
export type ContactRole = (typeof CONTACT_ROLES)[number];
export type UpdateField = (typeof UPDATE_FIELDS)[number];

export type Contact = {
  id: string;
  projectId: string;
  name: string;
  organization: string | null;
  role: ContactRole | string;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export type Milestone = {
  id: string;
  projectId: string;
  name: string;
  assignedBy: string | null;
  dueDate: string | null;
  status: Status;
  priority: Priority;
  notes: string | null;
  completedDate: string | null;
};

export type ProjectUpdate = {
  id: string;
  projectId: string;
  updateDate: string;
  updatedField: UpdateField | string;
  oldValue: string | null;
  newValue: string | null;
  reason: string;
  enteredBy: string | null;
};

export type ProjectNote = {
  id: string;
  projectId: string;
  title: string;
  content: string | null;
  createdAt: string;
};

export type ProjectSummary = {
  id: string;
  title: string;
  assignedDate: string | null;
  lastUpdateDate: string | null;
  primaryDueDate: string | null;
  completedDate: string | null;
  priority: Priority;
  status: Status;
  percentComplete: number;
  owner: string | null;
  departmentClient: string | null;
  nextAction: string | null;
  requestors: string[];
  tools: string[];
};

export type ProjectDetail = ProjectSummary & {
  summary: string | null;
  notes: string | null;
  milestones: Milestone[];
  updates: ProjectUpdate[];
  contacts: Contact[];
  projectNotes: ProjectNote[];
};

export type ProjectFilters = {
  status?: string;
  priority?: string;
  requestor?: string;
  query?: string;
};
