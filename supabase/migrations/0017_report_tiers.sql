-- Report package tiers: Basic (RM29, one panel) / Standard (RM49, all
-- panels, unchanged default) / Premium (RM89, priority + fast-tracked
-- consultation). Each is still a one-off Billplz bill -- Billplz has no
-- native recurring/subscription billing, so "automated billing" here means
-- the app computing the right one-time amount per tier, not a subscription.
alter table report_submissions
  add column if not exists report_tier text not null default 'standard';

alter table report_submissions
  drop constraint if exists report_submissions_report_tier_check;
alter table report_submissions
  add constraint report_submissions_report_tier_check
  check (report_tier in ('basic', 'standard', 'premium'));
