# Agentic Layer

## Risk Levels & Actions

### Low — Auto (no approval needed)
- `generate_summary_draft`: given report_type + markers, produce plain-language explanation → stored in `ai_summary_draft` with confidence + review_status = unreviewed
- `tag_report_type`: classify upload as cholesterol / HbA1c / liver / kidney / thyroid / FBC from filename or customer input
- `flag_urgency`: score submission 0–10 based on out-of-range markers

### Medium — Light approval (team confirms before executing)
- `update_report_status`: move submission through workflow states → team clicks confirm in dashboard
- `mark_payment_paid`: toggle payment status → team confirms

### High — Always approval (team must explicitly send)
- `send_delivery_email`: email customer with PDF link → team reviews PDF first, clicks Send button
- `send_feedback_request`: email customer requesting feedback → triggered only after delivery confirmed

### Critical — Human only (never automated)
- Delete any submission record
- Issue refund
- Provide any medical advice or diagnosis statement

## Named Tools (approved list)
- `supabase.insert`, `supabase.update`, `supabase.select` — scoped to app tables only
- `storage.upload` — PDF files to Supabase Storage only
- `email.send` — via approved transactional provider (e.g. Resend), high-risk gate

## Audit Log Fields
`actor`, `action`, `target_table`, `target_id`, `old_value`, `new_value`, `logged_at`

Every status change, delivery action, and AI draft generation writes an audit row.

## v1
Only low-risk auto actions (draft generation, tagging) run in v1. All medium/high actions are manual button clicks by the team. True agentic execution comes post lock-down.
