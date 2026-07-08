alter table report_deliveries add column if not exists email_sent_at timestamptz;
alter table report_deliveries add column if not exists email_sent_to text;
alter table report_deliveries add column if not exists email_send_error text;
