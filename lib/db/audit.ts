import { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  entry: {
    actor: string;
    action: string;
    target_table: string;
    target_id: string;
    old_value?: string | null;
    new_value?: string | null;
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    actor: entry.actor,
    action: entry.action,
    target_table: entry.target_table,
    target_id: entry.target_id,
    old_value: entry.old_value ?? null,
    new_value: entry.new_value ?? null,
    logged_at: new Date().toISOString(),
  });
  // Audit logging failures should never block the primary action, but we
  // don't want them silently invisible either.
  if (error) {
    console.error("audit log insert failed", error);
  }
}
