-- Referring doctor info, so the finished report can be emailed straight to
-- the doctor/clinic that ordered the test. The name is read off the lab
-- report's own "Referred By" field by the same AI extraction step used for
-- patient identity (lib/ai/extract-markers.ts); the email is never printed
-- on the report itself, so staff enter it manually in the dashboard.
alter table report_submissions
  add column if not exists referring_doctor_name text,
  add column if not exists referring_doctor_email text;
