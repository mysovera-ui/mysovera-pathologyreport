# Architecture — Mysovera Pathology Report Explainer

## Stack
- **Frontend:** Next.js (App Router) on Vercel
- **Database + Storage:** Supabase (Postgres + Storage for PDF/report files)
- **Auth (Sprint 4):** Supabase Auth — team only, not customers

## Now vs Later
**Now:** Static landing page, submission form, team dashboard, status workflow, delivery record, feedback form — all against live DB.
**Later:** Auth lock-down, AI summary drafts, email triggers, customer portal.

## Key User Action — Step by Step
1. Customer opens landing page (public, no login)
2. Fills submission form → row inserted into `report_submissions` (status: received)
3. Confirmation screen shows reference code
4. Team opens dashboard → sees new submission
5. Team updates status to `reviewing`, then `completed`
6. Team uploads PDF URL → row inserted into `report_deliveries`, submission status → `delivered`
7. Customer clicks feedback link → row inserted into `customer_feedback`
8. Every status change appended to `audit_logs`

## Layer Plan
1. **Data first:** tables + RLS + seed data (Sprint 1)
2. **App logic:** form → DB → dashboard CRUD → status transitions (Sprints 1–2)
3. **Smart features:** AI summary draft with human review gate (Sprint 3)

## Core Without AI
The entire submission → review → delivery workflow runs with zero AI. AI only adds a draft summary the team can edit. Removing AI does not break any workflow.
