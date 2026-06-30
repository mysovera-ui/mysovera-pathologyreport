create table if not exists report_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  customer_name text not null,
  email text not null,
  age integer,
  gender text,
  health_concern text,
  report_type text,
  file_url text,
  symptoms_notes text,
  payment_status text not null default 'unpaid',
  report_status text not null default 'received',
  reference_code text,
  submitted_at timestamptz not null default now(),
  delivered_at timestamptz,
  follow_up_interest boolean default false,
  ai_summary_draft text,
  ai_summary_source text,
  ai_summary_confidence numeric,
  ai_summary_review_status text default 'unreviewed'
);

alter table report_submissions enable row level security;
drop policy if exists "report_submissions_v1_read" on report_submissions;
create policy "report_submissions_v1_read" on report_submissions for select using (true);
drop policy if exists "report_submissions_v1_write" on report_submissions;
create policy "report_submissions_v1_write" on report_submissions for all using (true) with check (true);

create table if not exists report_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  submission_id uuid references report_submissions(id),
  pdf_url text,
  delivered_by text,
  delivery_notes text,
  delivered_at timestamptz not null default now()
);

alter table report_deliveries enable row level security;
drop policy if exists "report_deliveries_v1_read" on report_deliveries;
create policy "report_deliveries_v1_read" on report_deliveries for select using (true);
drop policy if exists "report_deliveries_v1_write" on report_deliveries;
create policy "report_deliveries_v1_write" on report_deliveries for all using (true) with check (true);

create table if not exists customer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  submission_id uuid references report_submissions(id),
  rating integer,
  feedback_text text,
  follow_up_interest boolean default false,
  submitted_at timestamptz not null default now()
);

alter table customer_feedback enable row level security;
drop policy if exists "customer_feedback_v1_read" on customer_feedback;
create policy "customer_feedback_v1_read" on customer_feedback for select using (true);
drop policy if exists "customer_feedback_v1_write" on customer_feedback;
create policy "customer_feedback_v1_write" on customer_feedback for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  actor text,
  action text,
  target_table text,
  target_id uuid,
  old_value text,
  new_value text,
  logged_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into report_submissions (id, customer_name, email, age, gender, health_concern, report_type, payment_status, report_status, reference_code, submitted_at, delivered_at, follow_up_interest, ai_summary_draft, ai_summary_source, ai_summary_confidence, ai_summary_review_status) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Priya Nair', 'priya.nair@email.com', 42, 'Female', 'My cholesterol came back high and I am not sure what LDL means', 'cholesterol', 'paid', 'delivered', 'REF-0001', now() - interval '5 days', now() - interval '3 days', true, 'Your LDL (bad cholesterol) is slightly above the recommended range. This means fatty deposits may build up in your arteries over time. Your doctor may suggest dietary changes or medication. Your HDL (good cholesterol) is within a healthy range, which is positive.', 'rule-based-v1', 0.82, 'reviewed'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Ahmad Fauzi', 'ahmad.fauzi@email.com', 55, 'Male', 'Worried about my HbA1c result — doctor mentioned borderline diabetes', 'HbA1c', 'paid', 'completed', 'REF-0002', now() - interval '3 days', null, false, 'Your HbA1c of 6.1% places you in the pre-diabetes range (5.7–6.4%). This does not mean you have diabetes, but it is a signal to make lifestyle changes now. Reducing sugar intake and increasing physical activity can bring this number down.', 'rule-based-v1', 0.79, 'unreviewed'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Linda Tan', 'linda.tan@email.com', 38, 'Female', 'My liver enzymes ALT and AST were flagged as high', 'liver', 'paid', 'reviewing', 'REF-0003', now() - interval '1 day', null, false, null, null, null, 'unreviewed'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Rajan Pillai', 'rajan.pillai@email.com', 61, 'Male', 'Full blood count — doctor said something about low haemoglobin', 'FBC', 'unpaid', 'received', 'REF-0004', now() - interval '6 hours', null, false, null, null, null, 'unreviewed');

insert into report_deliveries (submission_id, pdf_url, delivered_by, delivery_notes, delivered_at) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'https://storage.example.com/reports/REF-0001-summary.pdf', 'healthbridge-team', 'Delivered via email. Customer confirmed receipt.', now() - interval '3 days');

insert into customer_feedback (submission_id, rating, feedback_text, follow_up_interest, submitted_at) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 5, 'Finally I understand what my cholesterol numbers mean. The explanation was very clear and I felt much calmer going into my doctor appointment.', true, now() - interval '2 days');