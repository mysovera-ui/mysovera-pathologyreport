# Data Model

## report_submissions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | team owner at lock-down |
| customer_name | text | |
| email | text | |
| age | integer | |
| gender | text | |
| health_concern | text | free text from customer |
| report_type | text | cholesterol / HbA1c / liver / kidney / thyroid / FBC / other |
| file_url | text | Supabase Storage path |
| symptoms_notes | text | |
| payment_status | text | unpaid / paid / waived |
| report_status | text | received / reviewing / completed / delivered |
| reference_code | text | human-readable e.g. REF-0042 |
| submitted_at | timestamptz | |
| delivered_at | timestamptz nullable | |
| follow_up_interest | boolean | |
| ai_summary_draft | text | **AI field** |
| ai_summary_source | text | e.g. rule-based-v1 / gpt-4o |
| ai_summary_confidence | numeric | 0–1 |
| ai_summary_review_status | text | unreviewed / approved / edited / rejected |
| created_at | timestamptz | |

## report_deliveries
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| submission_id | uuid FK → report_submissions | |
| pdf_url | text | |
| delivered_by | text | team member name |
| delivery_notes | text | |
| delivered_at | timestamptz | |

## customer_feedback
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| submission_id | uuid FK → report_submissions | |
| rating | integer | 1–5 |
| feedback_text | text | |
| follow_up_interest | boolean | |
| submitted_at | timestamptz | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| actor | text | team member or 'system' |
| action | text | e.g. status_changed, pdf_delivered |
| target_table | text | |
| target_id | uuid | |
| old_value | text | |
| new_value | text | |
| logged_at | timestamptz | |

## RLS
All tables: permissive v1 policies (read + write open) until Sprint 4 lock-down replaces with `auth.uid() = user_id` owner policies.
