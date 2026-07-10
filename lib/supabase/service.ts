import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only privileged client using the service role key, which bypasses
// Row Level Security entirely. Use this for all table reads/writes from
// Server Components/Actions -- it's what lets the app keep working now that
// RLS denies the public anon key direct access to every table (see
// migration 0010_staff_auth_lockdown.sql). Never import this file from a
// Client Component or expose the service role key to the browser.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it in your environment (see .env.example).",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
