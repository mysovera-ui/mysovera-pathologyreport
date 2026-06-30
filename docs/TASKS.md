# Tasks & Sprints

## Sprint 1 — Database, landing page, submission form
**Goal:** App is live, seed data is visible, customers can submit a report.

- [ ] Run migration SQL (report_submissions, report_deliveries, customer_feedback, audit_logs + seed data)
- [ ] Build public landing page: headline, service description, report types covered, price/CTA
- [ ] Build submission form: name, email, age, gender, health concern, report type selector, file upload, symptoms notes
- [ ] Wire form to Supabase insert → report_submissions (status: received)
- [ ] Generate reference_code (e.g. REF-XXXX) on insert
- [ ] Show confirmation screen with reference number and "expect your report in 24–48 hours"
- [ ] Verify seeded demo rows render on `/dashboard` without login

**Definition of Done:** Landing page loads, form submits a real row, confirmation shows reference code, demo rows visible in dashboard.

---

## Sprint 2 — Team dashboard and delivery workflow ✅ v1 FUNCTIONAL MILESTONE
**Goal:** Team can manage submissions end-to-end, mark delivered, record PDF.

- [ ] `/dashboard` page: table of all submissions, columns: name, report type, status badge, payment status, submitted date
- [ ] Submission detail page: all fields, file link, status history
- [ ] Status update action: buttons for each transition (received → reviewing → completed → delivered), writes audit_log row
- [ ] Payment status toggle: unpaid / paid / waived
- [ ] Delivery form on detail page: PDF URL input + delivered_by + notes → inserts report_deliveries row, sets delivered_at
- [ ] Feedback link display on delivered submissions
- [ ] Empty state for dashboard with no submissions

**Definition of Done:** Full flow works — submit form → appears in dashboard → team updates status → marks delivered → delivery row saved. No dead buttons.

---

## Sprint 3 — Feedback capture and AI summary draft
**Goal:** Close the feedback loop; give team an AI draft to speed up report writing.

- [ ] Public `/feedback/[ref]` page: rating 1–5, free text, follow-up interest checkbox → inserts customer_feedback row
- [ ] Dashboard: feedback badge on delivered submissions, feedback detail visible in submission view
- [ ] AI draft panel in detail page: team enters key marker values → calls server action → generates plain-language draft → saved to ai_summary_draft with source/confidence/review_status
- [ ] Team can edit draft inline, save edited version, mark review_status = approved or edited
- [ ] Urgency score displayed on submission card (rule-based, based on report_type + markers)
- [ ] Audit log row written for every AI draft generation

**Definition of Done:** Feedback submits and links to submission. AI draft generates, saves, and is editable. Team can approve or reject draft.

---

## Sprint 4 — Lock it down (auth + RLS)
**Goal:** Protect real customer data before scaling.

- [ ] Supabase Auth: email/password login for team members
- [ ] `/dashboard` and `/dashboard/*` require authenticated session; redirect to `/login` if not
- [ ] Replace v1 permissive RLS policies with owner-scoped `auth.uid() = user_id` on all tables
- [ ] Customer pages (`/`, `/submit`, `/feedback/[ref]`) remain fully public
- [ ] Confirm no secrets in client bundle (audit env vars)
- [ ] Confirm audit_logs has no delete RLS policy

**Definition of Done:** Unauthenticated visit to `/dashboard` redirects to login. Authenticated team member sees all data. Customer pages still load without login.

---

## Gantt (text)
```
Sprint 1 — Week 1: DB + landing + submit form
Sprint 2 — Week 1: Team dashboard + delivery workflow  ← v1 functional
Sprint 3 — Week 2: Feedback + AI draft
Sprint 4 — Week 2: Auth lock-down
```
