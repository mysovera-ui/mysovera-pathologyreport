alter table report_submissions add column if not exists report_panels text[];
alter table report_submissions add column if not exists ai_structured_result jsonb;
alter table report_submissions add column if not exists generated_pdf_url text;
alter table report_submissions add column if not exists generated_pdf_generated_at timestamptz;
