"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/db/audit";
import { redirect } from "next/navigation";

export type SubmitFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export async function submitReportAction(
  _prevState: SubmitFormState,
  formData: FormData,
): Promise<SubmitFormState> {
  const customer_name = String(formData.get("customer_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const ageRaw = String(formData.get("age") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const health_concern = String(formData.get("health_concern") || "").trim();
  const report_type = String(formData.get("report_type") || "").trim();
  const symptoms_notes = String(formData.get("symptoms_notes") || "").trim();
  const file = formData.get("file") as File | null;

  const fieldErrors: Record<string, string> = {};
  if (!customer_name) fieldErrors.customer_name = "Name is required";
  if (!email || !email.includes("@")) fieldErrors.email = "A valid email is required";
  if (!report_type) fieldErrors.report_type = "Please select a report type";
  if (!health_concern) fieldErrors.health_concern = "Tell us your concern in a few words";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const age = ageRaw ? parseInt(ageRaw, 10) : null;

  const supabase = await createClient();

  let file_url: string | null = null;
  if (file && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return {
        error: "That file is larger than 10MB. Please upload a smaller file.",
      };
    }
    const ext = file.name.split(".").pop() || "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("report-files")
      .upload(path, file, { contentType: file.type || undefined });

    if (uploadError) {
      console.error("upload error", uploadError);
      return { error: "Something went wrong uploading your file. Please try again." };
    }
    const { data: publicUrl } = supabase.storage
      .from("report-files")
      .getPublicUrl(path);
    file_url = publicUrl.publicUrl;
  }

  const { data, error } = await supabase
    .from("report_submissions")
    .insert({
      customer_name,
      email,
      age,
      gender: gender || null,
      health_concern,
      report_type,
      symptoms_notes: symptoms_notes || null,
      file_url,
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
