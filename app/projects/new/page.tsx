import Link from "next/link";

import { ProjectForm } from "@/components/project-form";
import { createProjectAction } from "@/app/projects/actions";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function NewProjectPage() {
  return (
    <div className="stack-xl">
      <section className="page-heading">
        <div>
          <p className="eyebrow">New project</p>
          <h1>Create a project</h1>
          <p className="muted">Capture the main project details first, then add milestones, updates, and contacts.</p>
        </div>
        <Link href="/projects" className="button">
          Back to projects
        </Link>
      </section>

      {!isSupabaseConfigured() ? (
        <section className="card notice-card">
          <p>This form is ready, but saving is disabled until Supabase is configured.</p>
        </section>
      ) : null}

      <section className="card">
        <ProjectForm action={createProjectAction} submitLabel="Create project" />
      </section>
    </div>
  );
}
