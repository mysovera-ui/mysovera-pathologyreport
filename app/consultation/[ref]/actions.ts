"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { logAudit } from "@/lib/db/audit";
import {
  sendConsultationRequestConfirmation,
  sendConsultationRequestTeamAlert,
} from "@/lib/email/resend";
import type { ConsultationType } from "@/lib/db/types";

export type ConsultationFormState = { error?: string; success?: boolean };

export async function submitConsultationRequestAction(
  submissionId: string,
  referenceCode: string,
  _prevState: ConsultationFormState,
  formData: FormData,
): Promise<ConsultationFormState> {
  const customerName = String(formData.get("customer_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const consultationType = String(formData.get("consultation_type") || "nutritionist") as ConsultationType;
  const preferredTime = String(formData.get("preferred_time") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!customerName) return { error: "Please enter your name." };
  if (!email || !email.includes("@")) return { error: "Please enter a valid email." };

  const supabase = createServiceClient();

  const { error } = await supabase.from("consultation_requests").insert({
    submission_id: submissionId,
    customer_name: customerName,
    email,
    phone,
    consultation_type: consultationType,
    preferred_time: preferredTime,
    notes,
  });

  if (error) {
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor: email,
    action: "consultation_requested",
    target_table: "consultation_requests",
    target_id: submissionId,
    new_value: consultationType,
  });

  // Best-effort notifications — a failed email shouldn't block the request
  // from being recorded, since staff can still see it in the dashboard.
  try {
    await sendConsultationRequestConfirmation({
      to: email,
      customerName,
      referenceCode,
      consultationType,
    });
  } catch (err) {
    console.error("consultation confirmation email failed", err);
  }

  try {
    await sendConsultationRequestTeamAlert({
      customerName,
      referenceCode,
      email,
      phone,
      consultationType,
      preferredTime,
      notes,
    });
  } catch (err) {
    console.error("consultation team alert email failed", err);
  }

  return { success: true };
}
