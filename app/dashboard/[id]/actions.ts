"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";
import type { PaymentStatus, ReportStatus } from "@/lib/db/types";

const STATUS_ORDER: ReportStatus[] = [
  "received",
  "reviewing",
  "completed",
  "delivered",
];

export type ActionResult = { error?: string; success?: boolean };

export async function updateStatusAction(
  submissionId: string,
  nextStatus: ReportStatus,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("report_submissions")
    .select("report_status")
    .eq("id", submissionId)
    .single();

  if (fetchError || !current) {
    return { error: "Submission not found." };
  }

  const currentIdx = STATUS_ORDER.indexOf(current.report_status as ReportStatus);
  const nextIdx = STATUS_ORDER.indexOf(nextStatus);
  if (nextIdx !== currentIdx + 1) {
    return { error: "Invalid status transition." };
  }
  if (current.report_status === "delivered") {
    return { error: "This submission is already delivered." };
  }

  const { error } = await supabase
    .from("report_submissions")
    .update({ report_status: nextStatus })
    .eq("id", submissionId);

  if (error) {
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor: "healthbridge-team",
    action: "status_changed",
    target_table: "report_submissions",
    target_id: submissionId,
    old_value: current.report_status,
    new_value: nextStatus,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePaymentAction(
  submissionId: string,
  nextPayment: PaymentStatus,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("report_submissions")
    .select("payment_status")
    .eq("id", submissionId)
    .single();

  const { error } = await supabase
    .from("report_submissions")
    .update({ payment_status: nextPayment })
    .eq("id", submissionId);

  if (error) {
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor: "healthbridge-team",
    action: "payment_status_changed",
    target_table: "report_submissions",
    target_id: submissionId,
    old_value: current?.payment_status ?? null,
    new_value: nextPayment,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export type DeliverFormState = { error?: string };

export async function deliverReportAction(
  submissionId: string,
  _prevState: DeliverFormState,
  formData: FormData,
): Promise<DeliverFormState> {
  const pdf_url = String(formData.get("pdf_url") || "").trim();
  const delivered_by = String(formData.get("delivered_by") || "").trim();
  const delivery_notes = String(formData.get("delivery_notes") || "").trim();

  if (!pdf_url) return { error: "PDF URL is required." };
  if (!delivered_by) return { error: "Your name is required." };

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("report_submissions")
    .select("report_status")
    .eq("id", submissionId)
    .single();

  if (current?.report_status === "delivered") {
    return { error: "This submission has already been delivered." };
  }
  if (current?.report_status !== "completed") {
    return {
      error: "Mark the report Completed before recording delivery.",
    };
  }

  const { error: deliveryError } = await supabase
    .from("report_deliveries")
    .insert({
      submission_id: submissionId,
      pdf_url,
      delivered_by,
      delivery_notes: delivery_notes || null,
    });

  if (deliveryError) {
    return { error: "Something went wrong, please try again." };
  }

  const { error: updateError } = await supabase
    .from("report_submissions")
    .update({ report_status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", submissionId);

  if (updateError) {
    return { error: "Delivery saved but status update failed. Please refresh." };
  }

  await logAudit(supabase, {
    actor: delivered_by,
    action: "pdf_delivered",
    target_table: "report_submissions",
    target_id: submissionId,
    old_value: "completed",
    new_value: "delivered",
  });

  revalidatePath(`/dashboard/${submissionId}`);
  revalidatePath("/dashboard");
  return {};
}
