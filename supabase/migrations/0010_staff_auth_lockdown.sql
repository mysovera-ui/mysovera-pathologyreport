-- Security lockdown: the app's own server code will move to using the
-- Supabase service-role key (which always bypasses RLS) for every table
-- operation. These policies exist to protect the public anon key, which is
-- embedded in client-side JS and can otherwise be used to query the REST
-- API directly, bypassing the Next.js app entirely.

-- Staff allowlist. A user can only reach the team dashboard if their
-- authenticated email exists here. Only the service role can add/remove
-- staff; an authenticated user may only check their own row (needed by the
-- login gate, which runs with the anon+auth client, not service role).
create table if not exists staff_members (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table staff_members enable row level security;
drop policy if exists "staff_members_self_read" on staff_members;
create policy "staff_members_self_read" on staff_members for select using (email = auth.email());

insert into staff_members (email) values ('mysovera@gmail.com')
  on conflict (email) do nothing;

-- Drop the v1 "anyone can read/write everything" policies. No replacement
-- anon/authenticated policies are added — the app's server actions now use
-- the service-role key, which bypasses RLS entirely, so these tables become
-- unreachable via the public anon key once this ships.
drop policy if exists "report_submissions_v1_read" on report_submissions;
drop policy if exists "report_submissions_v1_write" on report_submissions;

drop policy if exists "report_deliveries_v1_read" on report_deliveries;
drop policy if exists "report_deliveries_v1_write" on report_deliveries;

drop policy if exists "customer_feedback_v1_read" on customer_feedback;
drop policy if exists "customer_feedback_v1_write" on customer_feedback;

drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
