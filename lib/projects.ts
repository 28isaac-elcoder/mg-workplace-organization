import "server-only";

import { notFound } from "next/navigation";

import { mockProjects } from "@/lib/mock-data";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";
import type {
  Contact,
  Milestone,
  ProjectDetail,
  ProjectFilters,
  ProjectNote,
  ProjectSummary,
  ProjectUpdate,
} from "@/lib/types";

type ProjectRow = {
  id: string;
  title: string;
  summary: string | null;
  assigned_date: string | null;
  last_update_date: string | null;
  primary_due_date: string | null;
  priority: ProjectSummary["priority"];
  status: ProjectSummary["status"];
  percent_complete: number;
  owner: string | null;
  department_client: string | null;
  next_action: string | null;
  notes: string | null;
  completed_date: string | null;
};

type RequestorJoinRow = {
  project_id: string;
  requestors: Array<{ name: string }> | { name: string } | null;
};

type ToolJoinRow = {
  project_id: string;
  tools: Array<{ name: string }> | { name: string } | null;
};

type MilestoneRow = {
  id: string;
  project_id: string;
  name: string;
  assigned_by: string | null;
  due_date: string | null;
  status: Milestone["status"];
  priority: Milestone["priority"];
  notes: string | null;
  completed_date: string | null;
};

type UpdateRow = {
  id: string;
  project_id: string;
  update_date: string;
  updated_field: ProjectUpdate["updatedField"];
  old_value: string | null;
  new_value: string | null;
  reason: string;
  entered_by: string | null;
};

type ContactRow = {
  id: string;
  project_id: string;
  name: string;
  organization: string | null;
  role: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type ProjectNoteRow = {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
};

type ProjectNoteDateRow = {
  project_id: string;
  relevant_date: string | null;
};

function toSummary(
  row: ProjectRow,
  requestors: string[],
  tools: string[],
): ProjectSummary {
  return {
    id: row.id,
    title: row.title,
    assignedDate: row.assigned_date,
    lastUpdateDate: row.last_update_date,
    primaryDueDate: row.primary_due_date,
    completedDate: row.completed_date,
    priority: row.priority,
    status: row.status,
    percentComplete: row.percent_complete,
    owner: row.owner,
    departmentClient: row.department_client,
    nextAction: row.next_action,
    requestors,
    tools,
    nextRelevantNoteDate: null,
  };
}

function toMilestone(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    assignedBy: row.assigned_by,
    dueDate: row.due_date,
    status: row.status,
    priority: row.priority,
    notes: row.notes,
    completedDate: row.completed_date,
  };
}

function toUpdate(row: UpdateRow): ProjectUpdate {
  return {
    id: row.id,
    projectId: row.project_id,
    updateDate: row.update_date,
    updatedField: row.updated_field,
    oldValue: row.old_value,
    newValue: row.new_value,
    reason: row.reason,
    enteredBy: row.entered_by,
  };
}

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    organization: row.organization,
    role: row.role,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
  };
}

function toProjectNote(row: ProjectNoteRow): ProjectNote {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    // New fields will be populated where available; fallback keeps demo mode resilient.
    category: (row as any).category ?? "general_note",
    otherCategory: (row as any).other_category ?? null,
    relevantDate: (row as any).relevant_date ?? null,
  };
}

function extractNamesFromRelation(
  items: Array<{ name: string }> | { name: string } | null | undefined,
) {
  if (items == null) return [];
  const list = Array.isArray(items) ? items : [items];
  return list.map((item) => item?.name).filter((value): value is string => Boolean(value));
}

function applyFilters(projects: ProjectSummary[], filters: ProjectFilters) {
  return projects.filter((project) => {
    if (filters.status && filters.status !== "All" && project.status !== filters.status) {
      return false;
    }

    if (filters.priority && filters.priority !== "All" && project.priority !== filters.priority) {
      return false;
    }

    if (filters.requestor && filters.requestor !== "All") {
      const hasRequestor = project.requestors.some(
        (requestor) => requestor.toLowerCase() === filters.requestor?.toLowerCase(),
      );
      if (!hasRequestor) return false;
    }

    if (filters.query) {
      const haystack = [
        project.title,
        project.owner ?? "",
        project.departmentClient ?? "",
        project.requestors.join(" "),
        project.tools.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(filters.query.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

export async function getProjects(filters: ProjectFilters = {}) {
  if (!isSupabaseConfigured()) {
    return applyFilters(
      mockProjects.map((project) => ({
        id: project.id,
        title: project.title,
        assignedDate: project.assignedDate,
        lastUpdateDate: project.lastUpdateDate,
        primaryDueDate: project.primaryDueDate,
        completedDate: project.completedDate,
        priority: project.priority,
        status: project.status,
        percentComplete: project.percentComplete,
        owner: project.owner,
        departmentClient: project.departmentClient,
        nextAction: project.nextAction,
        requestors: project.requestors,
        tools: project.tools,
        nextRelevantNoteDate: (project as any).nextRelevantNoteDate ?? null,
      })),
      filters,
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data: projectRows, error: projectError } = await supabase
    .from("projects")
    .select(
      "id,title,summary,assigned_date,last_update_date,primary_due_date,priority,status,percent_complete,owner,department_client,next_action,notes,completed_date",
    )
    .order("primary_due_date", { ascending: true, nullsFirst: false });

  if (projectError) {
    throw new Error(projectError.message);
  }

  const projects = (projectRows ?? []) as ProjectRow[];
  const ids = projects.map((project) => project.id);

  const [requestorRes, toolRes, notesDatesRes] = await Promise.all([
    supabase
      .from("project_requestors")
      .select("project_id, requestors(name)")
      .in("project_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]),
    supabase
      .from("project_tools")
      .select("project_id, tools(name)")
      .in("project_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"]),
    supabase
      .from("project_notes")
      .select("project_id,relevant_date")
      .in("project_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"])
      .gte("relevant_date", new Date().toISOString().slice(0, 10))
      .order("relevant_date", { ascending: true }),
  ]);

  if (requestorRes.error) throw new Error(requestorRes.error.message);
  if (toolRes.error) throw new Error(toolRes.error.message);
  // If project_notes or relevant_date doesn't exist yet, treat as no upcoming dates.
  const noteDatesRows: ProjectNoteDateRow[] =
    notesDatesRes.error || !notesDatesRes.data ? [] : ((notesDatesRes.data ?? []) as ProjectNoteDateRow[]);

  const nextRelevantNoteDateByProject = new Map<string, string>();
  for (const row of noteDatesRows) {
    if (!row.relevant_date) continue;
    if (!nextRelevantNoteDateByProject.has(row.project_id)) {
      nextRelevantNoteDateByProject.set(row.project_id, row.relevant_date);
    }
  }

  const requestorsByProject = new Map<string, string[]>();
  for (const row of (requestorRes.data ?? []) as RequestorJoinRow[]) {
    const list = requestorsByProject.get(row.project_id) ?? [];
    list.push(...extractNamesFromRelation(row.requestors));
    requestorsByProject.set(row.project_id, list);
  }

  const toolsByProject = new Map<string, string[]>();
  for (const row of (toolRes.data ?? []) as ToolJoinRow[]) {
    const list = toolsByProject.get(row.project_id) ?? [];
    list.push(...extractNamesFromRelation(row.tools));
    toolsByProject.set(row.project_id, list);
  }

  return applyFilters(
    projects.map((project) =>
      ({
        ...toSummary(
          project,
          requestorsByProject.get(project.id) ?? [],
          toolsByProject.get(project.id) ?? [],
        ),
        nextRelevantNoteDate: nextRelevantNoteDateByProject.get(project.id) ?? null,
      }) as ProjectSummary,
    ),
    filters,
  );
}

export async function getProjectById(id: string): Promise<ProjectDetail> {
  if (!isSupabaseConfigured()) {
    const project = mockProjects.find((item) => item.id === id);
    if (!project) notFound();
    return project;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) notFound();

  const { data: projectRow, error: projectError } = await supabase
    .from("projects")
    .select(
      "id,title,summary,assigned_date,last_update_date,primary_due_date,priority,status,percent_complete,owner,department_client,next_action,notes,completed_date",
    )
    .eq("id", id)
    .single();

  if (projectError || !projectRow) {
    notFound();
  }

  const [requestorRes, toolRes, milestoneRes, updateRes, contactRes, notesRes] = await Promise.all([
    supabase.from("project_requestors").select("project_id, requestors(name)").eq("project_id", id),
    supabase.from("project_tools").select("project_id, tools(name)").eq("project_id", id),
    supabase
      .from("milestones")
      .select("id,project_id,name,assigned_by,due_date,status,priority,notes,completed_date")
      .eq("project_id", id)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("project_updates")
      .select("id,project_id,update_date,updated_field,old_value,new_value,reason,entered_by")
      .eq("project_id", id)
      .order("update_date", { ascending: false }),
    supabase
      .from("contacts")
      .select("id,project_id,name,organization,role,email,phone,notes")
      .eq("project_id", id)
      .order("name", { ascending: true }),
    supabase
      .from("project_notes")
      .select("id,project_id,title,content,created_at,category,other_category,relevant_date")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (requestorRes.error) throw new Error(requestorRes.error.message);
  if (toolRes.error) throw new Error(toolRes.error.message);
  if (milestoneRes.error) throw new Error(milestoneRes.error.message);
  if (updateRes.error) throw new Error(updateRes.error.message);
  if (contactRes.error) throw new Error(contactRes.error.message);
  // If project_notes table does not exist yet, treat as empty instead of crashing
  const projectNotesRows =
    notesRes.error !== null ? [] : ((notesRes.data ?? []) as ProjectNoteRow[]);

  const requestors = ((requestorRes.data ?? []) as RequestorJoinRow[])
    .flatMap((row) => extractNamesFromRelation(row.requestors));
  const tools = ((toolRes.data ?? []) as ToolJoinRow[])
    .flatMap((row) => extractNamesFromRelation(row.tools));

  const project = projectRow as ProjectRow;

  return {
    ...toSummary(project, requestors, tools),
    summary: project.summary,
    notes: project.notes,
    milestones: ((milestoneRes.data ?? []) as MilestoneRow[]).map(toMilestone),
    updates: ((updateRes.data ?? []) as UpdateRow[]).map(toUpdate),
    contacts: ((contactRes.data ?? []) as ContactRow[]).map(toContact),
    projectNotes: projectNotesRows.map(toProjectNote),
  };
}

export async function getProjectChoices() {
  const projects = await getProjects();
  return projects.map((project) => ({ id: project.id, title: project.title }));
}
