alter table report_submissions add column if not exists marker_input text;
alter table report_submissions add column if not exists urgency_score numeric;
alter table report_submissions add column if not exists ai_risk_flags text;
