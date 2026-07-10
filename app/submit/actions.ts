"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { logAudit } from "@/lib/db/audit";
import { redirect } from "next/navigation";

export type SubmitFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitReportAction(
  _prevState: SubmitFormState,
  formData: FormData,
): Promise<SubmitFormState> {
  const customer_name = String(formData.get("customer_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const ageRaw = String(formData.get("age") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const health_concern = String(formData.get("health_concern") || "").trim();
  const report_panels = formData.getAll("report_panels").map((v) => String(v));
  const symptoms_notes = String(formData.get("symptoms_notes") || "").trim();
  // Files are uploaded client-side straight to Supabase Storage (see
  // submit/page.tsx) so they never pass through this server action's body —
  // Vercel functions cap request bodies at ~4.5MB, well under the up-to-10MB
  // combined reports we need to accept. Only the resulting public URLs cross
  // the server boundary, as a JSON-encoded array (max 10 files, 10MB total,
  // enforced client-side before upload).
  let file_urls: string[] = [];
  try {
    const raw = String(formData.get("file_urls") || "[]");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      file_urls = parsed.filter((u): u is string => typeof u === "string" && u.length > 0).slice(0, 10);
    }
  } catch {
    file_urls = [];
  }
  const file_url = file_urls[0] ?? null;

  const fieldErrors: Record<string, string> = {};
  if (!customer_name) fieldErrors.customer_name = "Name is required";
  if (!email || !email.includes("@")) fieldErrors.email = "A valid email is required";
  if (report_panels.length === 0) fieldErrors.report_panels = "Select at least one panel (or \"Other / Not Sure\")";
  if (!health_concern) fieldErrors.health_concern = "Tell us your concern in a few words";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const age = ageRaw ? parseInt(ageRaw, 10) : null;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("report_submissions")
    .insert({
      customer_name,
      email,
      age,
      gender: gender || null,
      health_concern,
      report_type: report_panels.join(", "),
      report_panels,
      symptoms_notes: symptoms_notes || null,
      file_url,
      file_urls,
      payment_status: "unpaid",
      report_status: "received",
      follow_up_interest: false,
    })
    .select("id, reference_code")
    .single();

  if (error || !data) {
    console.error("insert error", error);
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor: "system",
    action: "submission_created",
    target_table: "report_submissions",
    target_id: data.id,
    new_value: "received",
  });

  redirect(`/submitted/${data.reference_code}`);
}
