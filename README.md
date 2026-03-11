# Personal Organizer App

A lightweight Next.js app for tracking:

- projects
- milestones
- update history
- contacts
- requestors
- required tools/software

## Stack

- `Next.js`
- `Supabase`
- `Vercel`

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

3. Run the schema in your Supabase SQL editor:

- [`supabase/schema.sql`](supabase/schema.sql)

4. Start the app:

```bash
npm run dev
```

If Supabase is not configured, the app falls back to demo data so you can still review the UI.

## Deployment

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.

## Version 1 workflow

- Create a project
- Add requestors and tools as comma-separated values
- Add milestones, updates, and contacts from the project detail page
- Filter projects by status, priority, requestor, or search text
