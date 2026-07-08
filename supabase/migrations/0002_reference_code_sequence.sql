create sequence if not exists report_reference_seq;
select setval('report_reference_seq', greatest((select coalesce(max(substring(reference_code from 5)::int),0) from report_submissions where reference_code ~ '^REF-[0-9]+$'), 0));
alter table report_submissions alter column reference_code set default ('REF-' || lpad(nextval('report_reference_seq')::text, 4, '0'));
alter table report_submissions alter column reference_code set not null;
alter table report_submissions add constraint report_submissions_reference_code_unique unique (reference_code);
create index if not exists idx_report_submissions_status on report_submissions (report_status);
create index if not exists idx_report_deliveries_submission on report_deliveries (submission_id);
create index if not exists idx_customer_feedback_submission on customer_feedback (submission_id);
