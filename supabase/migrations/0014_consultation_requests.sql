-- "Request a consultation" — a lightweight interest-capture form, not a
-- real-time booking/scheduling system (no partner practitioner is
-- confirmed yet). Customers submit a request; staff manually arrange the
-- actual appointment and track it here using the same new/contacted/
-- scheduled/done pipeline as follow-ups.

create table if not exists consultation_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references report_submissions(id),
  customer_name text not null,
  email text not null,
  phone text,
  consultation_type text not null default 'nutritionist',
  preferred_time text,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table consultation_requests
  add constraint consultation_requests_type_check
  check (consultation_type in ('nutritionist', 'doctor', 'either'));

alter table consultation_requests
  add constraint consultation_requests_status_check
  check (status in ('new', 'contacted', 'scheduled', 'done'));

-- Same pattern as every other table since the Sprint 4 lockdown: RLS is on
-- with no permissive policy, so the anon key gets zero access. All reads/
-- writes go through the service-role client from server actions.
alter table consultation_requests enable row level security;
