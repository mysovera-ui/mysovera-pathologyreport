# Security

## Secret Handling
- Supabase service role key: server-side only (Next.js API routes / server actions). Never in client bundle.
- Supabase anon key: client-safe — used only for public read/write under v1 permissive RLS.
- AI API keys (OpenAI etc.): server-side only, never referenced in frontend code.
- All keys in `.env.local` / Vercel environment variables. No secrets in source code.

## Permission Model (v1 → lock-down)
- **v1 (demo):** RLS policies open — any visitor can read/write. Safe for demo; no PII at scale yet.
- **Sprint 4 lock-down:** Replace all `using (true)` policies with `auth.uid() = user_id`. Team members must be authenticated to access dashboard. Customer-facing pages (landing, submit, feedback) stay public.
- Customers are never given accounts in v1. File uploads use a randomised path in Supabase Storage.

## Approved Tools Rule
Agents may only call the named tools listed in AGENTIC_LAYER.md. No `eval`, no dynamic SQL construction, no `send_any` shortcuts. Every agent action is scoped to the authenticated user's permissions.

## Audit Principle
Every meaningful write action (status change, delivery, AI draft generation, email send) appends a row to `audit_logs`. Logs are append-only — no delete policy on `audit_logs`.
