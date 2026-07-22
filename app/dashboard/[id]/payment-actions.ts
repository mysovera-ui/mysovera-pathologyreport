"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { logAudit } from "@/lib/db/audit";
import { createBill } from "@/lib/billplz/client";
import { sendPaymentRequestEmail } from "@/lib/email/resend";
import { priceCentsForTier } from "@/lib/billplz/pricing";
import { revalidatePath } from "next/cache";

export type PaymentLinkState = { error?: string; success?: boolean };

export async function sendPaymentLinkAction(submissionId: string): Promise<PaymentLinkState> {
  const supabase = createServiceClient();

  const { data: submission, error: subError } = await supabase
    .from("report_submissions")
    .select("customer_name, email, reference_code, report_status, payment_status, billplz_bill_id, billplz_url, report_tier")
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return { error: "Submission not found." };
  }
  if (submission.report_status !== "completed" && submission.report_status !== "delivered") {
    return { error: "Mark the report Completed before requesting payment." };
  }
  if (submission.payment_status === "paid" || submission.payment_status === "waived") {
    return { error: `Payment is already ${submission.payment_status} for this submission.` };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const amountCents = priceCentsForTier(submission.report_tier);

  let billId = submission.billplz_bill_id;
  let billUrl = submission.billplz_url;

  // Reuse the existing bill if one was already created (avoids creating a
  // fresh Billplz bill every time staff click "resend").
  if (!billId || !billUrl) {
    try {
      const bill = await createBill({
        name: submission.customer_name,
        email: submission.email,
        amountCents,
        description: `HealthLens report (${submission.reference_code})`,
        referenceCode: submission.reference_code,
        callbackUrl: `${appUrl}/api/billplz/callback`,
        redirectUrl: `${appUrl}/payment-complete?ref=${submission.reference_code}`,
      });
      billId = bill.billId;
      billUrl = bill.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const friendly =
        message === "BILLPLZ_NOT_CONFIGURED"
          ? "Payment isn't set up yet — add the Billplz environment variables first."
          : `Failed to create payment bill: ${message}`;
      return { error: friendly };
    }

    const { error: updateError } = await supabase
      .from("report_submissions")
      .update({ billplz_bill_id: billId, billplz_url: billUrl })
      .eq("id", submissionId);

    if (updateError) {
      return { error: "Bill created but failed to save. Please try again." };
    }

    await logAudit(supabase, {
      actor: "healthbridge-team",
      action: "billplz_bill_created",
      target_table: "report_submissions",
      target_id: submissionId,
      new_value: billId,
    });
  }

  try {
    await sendPaymentRequestEmail({
      to: submission.email,
      customerName: submission.customer_name,
      referenceCode: submission.reference_code,
      paymentUrl: billUrl!,
      amountLabel: `RM ${amountCents / 100}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const friendly =
      message === "EMAIL_NOT_CONFIGURED"
        ? "Email sending isn't set up yet — add RESEND_API_KEY to the project's environment variables first."
        : `Bill created, but failed to email the customer: ${message}`;
    return { error: friendly };
  }

  await logAudit(supabase, {
    actor: "healthbridge-team",
    action: "payment_link_sent",
    target_table: "report_submissions",
    target_id: submissionId,
    new_value: submission.email,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return { success: true };
}
