-- Follow-up / simple CRM tracking. A customer signals interest in a
-- follow-up consultation via the feedback form (customer_feedback.
-- follow_up_interest); this adds a status staff can move through a simple
-- pipeline, plus a running notes log so more than one person can leave
-- context over time (calls made, outcome, next step) without overwriting
-- each other.

alter table report_submissions
  add column if not exists follow_up_status text not null default 'new';

alter table report_submissions
  drop constraint if exists report_submissions_follow_up_status_check;
alter table report_submissions
  add constraint report_submissions_follow_up_status_check
  check (follow_up_status in ('new', 'contacted', 'scheduled', 'done'));

create table if not exists follow_up_notes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references report_submissions(id),
  note text not null,
  author text not null,
  created_at timestamptz not null default now()
);

-- Same pattern as every other table since the Sprint 4 lockdown: RLS is on
-- with no permissive policy, so the anon key gets zero access. All reads/
-- writes go through the service-role client from server actions.
alter table follow_up_notes enable row level security;
