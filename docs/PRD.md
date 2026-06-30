# PRD — Mysovera Pathology Report Explainer

## Problem
People receive blood test and lab reports but cannot interpret the numbers. Medical jargon causes confusion and anxiety. They need a plain-language explanation — not a diagnosis — to feel informed before speaking to their doctor.

## Target User
Adults 35+ who have recently completed a blood test. Primary concerns: cholesterol, blood sugar (HbA1c), liver, kidney, thyroid, inflammation, or full blood count. Secondary user: the Health Bridge Solution team who processes and delivers reports.

## Core Objects
- **Report Submission** — customer record + uploaded file + status
- **Report Delivery** — PDF link + delivery timestamp
- **Customer Feedback** — rating + free text + follow-up interest
- **Audit Log** — every status change by team

## MVP Must-Haves (v1)
- [ ] Public landing page with service description and submit CTA
- [ ] Submission form: name, email, age, gender, health concern, report type, file upload
- [ ] Confirmation screen with reference number
- [ ] Team dashboard: list all submissions, view detail, update status
- [ ] Status workflow: received → reviewing → completed → delivered
- [ ] Payment status toggle: unpaid / paid
- [ ] Delivery action: attach PDF URL, mark delivered
- [ ] Feedback page: rating, free text, follow-up interest toggle
- [ ] Seed demo data visible without login

## Non-Goals (v1)
Automated AI PDF generation, customer login portal, doctor booking, bilingual reports, automated email sending, multiple package tiers, mobile app.

## Success Scenario
A customer lands on the page, fills in the form, uploads their cholesterol report, and submits. The team sees the submission in the dashboard, uploads the plain-language PDF, marks it delivered. The customer clicks the feedback link and rates the service 5 stars and requests a follow-up consultation. All data is in the database. No step is a dead end.
