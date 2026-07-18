"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { logAudit } from "@/lib/db/audit";
import { sendReferringDoctorReportEmail } from "@/lib/email/resend";
import { revalidatePath } from "next/cache";

export type ReferringDoctorActionState = { error?: string; success?: boolean };

export async function sendReferringDoctorReportAction(
  submissionId: string,
): Promise<ReferringDoctorActionState> {
  const supabase = createServiceClient();

  const { data: submission, error: subError } = await supabase
    .from("report_submissions")
    .select(
      "customer_name, reference_code, generated_pdf_url, referring_doctor_name, referring_doctor_email",
    )
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return { error: "Submission not found." };
  }
  if (!submission.generated_pdf_url) {
    return { error: "Generate the branded PDF first — there's nothing to send yet." };
  }
  if (!submission.referring_doctor_email) {
    return { error: "Enter the referring doctor's email first." };
  }

  try {
    await sendReferringDoctorReportEmail({
      to: submission.referring_doctor_email,
      doctorName: submission.referring_doctor_name || "Doctor",
      customerName: submission.customer_name,
      referenceCode: submission.reference_code,
      pdfUrl: submission.generated_pdf_url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const friendly =
      message === "EMAIL_NOT_CONFIGURED"
        ? "Email sending isn't set up yet — add RESEND_API_KEY to the project's environment variables first."
        : `Failed to send: ${message}`;
    return { error: friendly };
  }

  await logAudit(supabase, {
    actor: "healthbridge-team",
    action: "referring_doctor_report_sent",
    target_table: "report_submissions",
    target_id: submissionId,
    new_value: submission.referring_doctor_email,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return { success: true };
}
