-- Extracted patient identity fields (full legal name, age, gender, NRIC) as
-- read directly off the uploaded lab report/photo by the AI extraction step
-- (lib/ai/extract-markers.ts), kept separate from the customer-entered
-- customer_name/age/gender columns collected at submission time. The
-- branded PDF (cover page + Patient Details section) renders from these
-- extracted_* columns so the document reflects the source document, and
-- is left blank whenever extraction found nothing valid rather than
-- silently falling back to the self-reported values.
alter table report_submissions
  add column if not exists extracted_full_name text,
  add column if not exists extracted_age integer,
  add column if not exists extracted_gender text,
  add column if not exists extracted_nric text;
