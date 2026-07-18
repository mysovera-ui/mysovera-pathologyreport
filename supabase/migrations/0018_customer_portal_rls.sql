-- Customer self-serve portal: lets a customer log in (magic link, via
-- Supabase Auth) and see their own report history, without weakening the
-- Sprint 4 lockdown. The anon key alone still has zero access -- this only
-- grants SELECT to a request carrying a verified session JWT (the
-- "authenticated" role), and only for rows whose email matches that
-- session's own verified email. Staff/dashboard code continues to use the
-- service-role client and is unaffected by this policy.
drop policy if exists "customers_read_own_submissions" on report_submissions;
create policy "customers_read_own_submissions" on report_submissions
  for select
  to authenticated
  using (email = auth.email());
