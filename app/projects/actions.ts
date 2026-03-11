"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { parseListInput, parseNullableString, parsePercent } from "@/lib/utils";

async function getOrCreateLookupIds(table: "requestors" | "tools", names: string[]) {
  const supabase = getSupabaseServerClient();
  if (!supabase || names.length === 0) return [];

  const { data: existingRows, error: selectError } = await supabase
    .from(table)
    .select("id,name")
    .in("name", names);

  if (selectError) throw new Error(selectError.message);

  const existingMap = new Map((existingRows ?? []).map((row) => [row.name as string, row.id as string]));
  const missingNames = names.filter((name) => !existingMap.has(name));

  if (missingNames.length > 0) {
    const { data: insertedRows, error: insertError } = await supabase
      .from(table)
      .insert(missingNames.map((name) => ({ name })))
      .select("id,name");

    if (insertError) throw new Error(insertError.message);

    for (const row of insertedRows ?? []) {
      existingMap.set(row.name as string, row.id as string);
    }
  }

  return names.map((name) => existingMap.get(name)).filter((value): value is string => Boolean(value));
}

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    redirect("/projects?message=Connect+Supabase+to+save+changes");
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function createProjectAction(formData: FormData) {
  const supabase = ensureSupabase();

  const requestors = parseListInput(formData.get("requestors"));
  const tools = parseListInput(formData.get("tools"));

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      title: String(formData.get("title") ?? "").trim(),
      summary: parseNullableString(formData.get("summary")),
      assigned_date: parseNullableString(formData.get("assignedDate")),
      last_update_date: parseNullableString(formData.get("lastUpdateDate")),
      primary_due_date: parseNullableString(formData.get("primaryDueDate")),
      priority: String(formData.get("priority") ?? "Medium"),
      status: String(formData.get("status") ?? "Not Started"),
      percent_complete: parsePercent(formData.get("percentComplete")),
      owner: parseNullableString(formData.get("owner")),
      department_client: parseNullableString(formData.get("departmentClient")),
      next_action: parseNullableString(formData.get("nextAction")),
      notes: parseNullableString(formData.get("notes")),
      completed_date: parseNullableString(formData.get("completedDate")),
    })
    .select("id")
    .single();

  if (error || !project) {
    throw new Error(error?.message ?? "Unable to create project.");
  }

  const [requestorIds, toolIds] = await Promise.all([
    getOrCreateLookupIds("requestors", requestors),
    getOrCreateLookupIds("tools", tools),
  ]);

  if (requestorIds.length > 0) {
    const { error: joinError } = await supabase.from("project_requestors").insert(
      requestorIds.map((requestorId) => ({
        project_id: project.id,
        requestor_id: requestorId,
      })),
    );
    if (joinError) throw new Error(joinError.message);
  }

  if (toolIds.length > 0) {
    const { error: joinError } = await supabase.from("project_tools").insert(
      toolIds.map((toolId) => ({
        project_id: project.id,
        tool_id: toolId,
      })),
    );
    if (joinError) throw new Error(joinError.message);
  }

  revalidatePath("/projects");
  redirect(`/projects/${project.id}/edit`);
}

export async function updateProjectAction(formData: FormData) {
  const supabase = ensureSupabase();
  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    throw new Error("Missing project id.");
  }

  const requestors = parseListInput(formData.get("requestors"));
  const tools = parseListInput(formData.get("tools"));

  const { error } = await supabase
    .from("projects")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      summary: parseNullableString(formData.get("summary")),
      assigned_date: parseNullableString(formData.get("assignedDate")),
      last_update_date: parseNullableString(formData.get("lastUpdateDate")),
      primary_due_date: parseNullableString(formData.get("primaryDueDate")),
      priority: String(formData.get("priority") ?? "Medium"),
      status: String(formData.get("status") ?? "Not Started"),
      percent_complete: parsePercent(formData.get("percentComplete")),
      owner: parseNullableString(formData.get("owner")),
      department_client: parseNullableString(formData.get("departmentClient")),
      next_action: parseNullableString(formData.get("nextAction")),
      notes: parseNullableString(formData.get("notes")),
      completed_date: parseNullableString(formData.get("completedDate")),
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  await Promise.all([
    supabase.from("project_requestors").delete().eq("project_id", projectId),
    supabase.from("project_tools").delete().eq("project_id", projectId),
  ]);

  const [requestorIds, toolIds] = await Promise.all([
    getOrCreateLookupIds("requestors", requestors),
    getOrCreateLookupIds("tools", tools),
  ]);

  if (requestorIds.length > 0) {
    const { error: joinError } = await supabase.from("project_requestors").insert(
      requestorIds.map((requestorId) => ({
        project_id: projectId,
        requestor_id: requestorId,
      })),
    );
    if (joinError) throw new Error(joinError.message);
  }

  if (toolIds.length > 0) {
    const { error: joinError } = await supabase.from("project_tools").insert(
      toolIds.map((toolId) => ({
        project_id: projectId,
        tool_id: toolId,
      })),
    );
    if (joinError) throw new Error(joinError.message);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function createMilestoneAction(formData: FormData) {
  const supabase = ensureSupabase();
  const projectId = String(formData.get("projectId") ?? "");

  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    name: String(formData.get("name") ?? "").trim(),
    assigned_by: parseNullableString(formData.get("assignedBy")),
    due_date: parseNullableString(formData.get("dueDate")),
    status: String(formData.get("status") ?? "Not Started"),
    priority: String(formData.get("priority") ?? "Medium"),
    notes: parseNullableString(formData.get("notes")),
    completed_date: parseNullableString(formData.get("completedDate")),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/edit`);
  redirect(`/projects/${projectId}/edit`);
}

export async function createProjectUpdateAction(formData: FormData) {
  const supabase = ensureSupabase();
  const projectId = String(formData.get("projectId") ?? "");

  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    update_date: parseNullableString(formData.get("updateDate")) ?? new Date().toISOString().slice(0, 10),
    updated_field: String(formData.get("updatedField") ?? "Status"),
    old_value: parseNullableString(formData.get("oldValue")),
    new_value: parseNullableString(formData.get("newValue")),
    reason: String(formData.get("reason") ?? "").trim(),
    entered_by: parseNullableString(formData.get("enteredBy")),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/edit`);
  redirect(`/projects/${projectId}/edit`);
}

export async function createContactAction(formData: FormData) {
  const supabase = ensureSupabase();
  const projectId = String(formData.get("projectId") ?? "");

  const { error } = await supabase.from("contacts").insert({
    project_id: projectId,
    name: String(formData.get("name") ?? "").trim(),
    organization: parseNullableString(formData.get("organization")),
    role: String(formData.get("role") ?? "Client Contact"),
    email: parseNullableString(formData.get("email")),
    phone: parseNullableString(formData.get("phone")),
    notes: parseNullableString(formData.get("notes")),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/edit`);
  redirect(`/projects/${projectId}/edit`);
}

export async function createProjectNoteAction(formData: FormData) {
  const supabase = ensureSupabase();
  const projectId = String(formData.get("projectId") ?? "");

  const { error } = await supabase.from("project_notes").insert({
    project_id: projectId,
    title: String(formData.get("title") ?? "").trim(),
    content: parseNullableString(formData.get("content")),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/edit`);
  redirect(`/projects/${projectId}/edit`);
}

export async function deleteProjectNoteAction(formData: FormData) {
  const supabase = ensureSupabase();
  const projectId = String(formData.get("projectId") ?? "");
  const noteId = String(formData.get("noteId") ?? "");

  if (!noteId) {
    throw new Error("Note ID is required.");
  }

  const { error } = await supabase.from("project_notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/edit`);
  redirect(`/projects/${projectId}/edit`);
}
