"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { logAudit } from "@/lib/db/audit";
import { sendDeliveryEmail } from "@/lib/email/resend";
import { revalidatePath } from "next/cache";

export type EmailActionState = { error?: string; success?: boolean };

export async function sendDeliveryEmailAction(submissionId: string): Promise<EmailActionState> {
  const supabase = createServiceClient();

  const { data: submission, error: subError } = await supabase
    .from("report_submissions")
    .select("customer_name, email, reference_code, report_status, payment_status")
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return { error: "Submission not found." };
  }
  if (submission.report_status !== "delivered") {
    return { error: "Mark the report Delivered before sending the email." };
  }
  if (submission.payment_status !== "paid" && submission.payment_status !== "waived") {
    return { error: "Payment hasn't been received yet — send the payment link first, or mark payment as waived." };
  }

  const { data: delivery, error: delError } = await supabase
    .from("report_deliveries")
    .select("id, pdf_url, delivered_by")
    .eq("submission_id", submissionId)
    .order("delivered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (delError || !delivery || !delivery.pdf_url) {
    return { error: "No delivery record with a PDF URL found for this submission." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const feedbackUrl = `${appUrl}/feedback/${submission.reference_code}`;
  const consultationUrl = `${appUrl}/consultation/${submission.reference_code}`;

  try {
    await sendDeliveryEmail({
      to: submission.email,
      customerName: submission.customer_name,
      referenceCode: submission.reference_code,
      pdfUrl: delivery.pdf_url,
      deliveredBy: delivery.delivered_by || "HealthLens",
      feedbackUrl,
      consultationUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const friendly =
      message === "EMAIL_NOT_CONFIGURED"
        ? "Email sending isn't set up yet — add RESEND_API_KEY to the project's environment variables first."
        : `Failed to send: ${message}`;

    await supabase
      .from("report_deliveries")
      .update({ email_send_error: friendly })
      .eq("id", delivery.id);

    await logAudit(supabase, {
      actor: "healthbridge-team",
      action: "delivery_email_failed",
      target_table: "report_deliveries",
      target_id: delivery.id,
      new_value: friendly,
    });

    revalidatePath(`/dashboard/${submissionId}`);
    return { error: friendly };
  }

  await supabase
    .from("report_deliveries")
    .update({
      email_sent_at: new Date().toISOString(),
      email_sent_to: submission.email,
      email_send_error: null,
    })
    .eq("id", delivery.id);

  await logAudit(supabase, {
    actor: "healthbridge-team",
    action: "delivery_email_sent",
    target_table: "report_deliveries",
    target_id: delivery.id,
    new_value: submission.email,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return { success: true };
}
