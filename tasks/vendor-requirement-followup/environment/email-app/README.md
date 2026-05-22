# Email Application — Frontend SPA

This directory holds the React/Vite frontend for the simulated email app.
Only the `frontend/` source is shipped per task; it is built into the
per-task base Docker image and served at `/opt/mock/frontend/email`.

The backend is **not** in this directory. It is the shared Bun mock
`mock-email` binary built from `mock-platform/mocks/email/`:

- Source: `mock-platform/mocks/email/`
- Per-task seed: `mock-platform/mocks/email/src/seed.ts`
  (selected by the `TASK_NAME` env var at container startup)
- Runtime data: `/var/lib/mock-data/email/email.db` (SQLite)
- HTTP API: `http://localhost:5001/api/` (login → Bearer token →
  `POST /api/emails`)

## Database Schema (read-only reference for verifiers)

The Bun mock owns the schema. Verifiers query the SQLite file directly.

```sql
users(id, username, email, password_hash, created_at)
emails(id, sender_id, recipient_id, recipient_email, subject, body,
       folder, is_read, created_at, updated_at)
attachments(id, email_id, filename, original_filename, file_path,
            file_size, mime_type, created_at)
```

`folder` is one of `inbox`, `sent`, `drafts`, `trash`. `recipient_id`
may be NULL for external recipients (in which case `recipient_email`
is the source of truth).

## API endpoints (mirrors the legacy Flask app)

| Method | Path                          | Purpose                        |
|--------|-------------------------------|--------------------------------|
| POST   | `/api/auth/register`          | Register a new user            |
| POST   | `/api/auth/login`             | Returns `access_token`         |
| GET    | `/api/auth/me`                | Current user                   |
| GET    | `/api/emails?folder=…`        | List emails in a folder        |
| GET    | `/api/emails/<id>`            | Read a single email            |
| POST   | `/api/emails`                 | Create a draft / send          |
| PUT    | `/api/emails/<id>`            | Update a draft                 |
| DELETE | `/api/emails/<id>`            | Move to trash / permanent del. |
| PUT    | `/api/emails/<id>/read`       | Toggle read flag               |
| PUT    | `/api/emails/<id>/send`       | Send an existing draft         |
| POST   | `/api/attachments/upload`     | Upload attachment              |
| GET    | `/api/attachments/<id>/...`   | Download attachment            |

## Where the frontend talks to

`frontend/` issues HTTP requests against the Bun mock at the same
`/api/*` paths; no in-task backend process is required.
