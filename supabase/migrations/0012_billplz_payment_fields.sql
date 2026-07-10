alter table report_submissions add column if not exists billplz_bill_id text;
alter table report_submissions add column if not exists billplz_url text;
alter table report_submissions add column if not exists billplz_paid_at timestamptz;
