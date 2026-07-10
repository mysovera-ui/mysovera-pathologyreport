import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { logAudit } from "@/lib/db/audit";
import { verifyXSignature, getBillplzXSignatureKey } from "@/lib/billplz/client";

// Billplz posts application/x-www-form-urlencoded to this URL when a bill's
// payment state changes. Must respond with HTTP 200 quickly (Billplz retries
// up to 5 times over 24h+ if it doesn't see a 200). The redirect the customer
// sees in their browser (app/payment-complete) is NOT authoritative — this
// server-to-server callback, with its verified X Signature, is the only
// source of truth for flipping payment_status.
export async function POST(request: Request) {
  let params: Record<string, string> = {};

  try {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let xSignatureKey: string;
  try {
    xSignatureKey = getBillplzXSignatureKey();
  } catch {
    // Not configured — nothing we can do, acknowledge so Billplz stops retrying.
    return NextResponse.json({ error: "Not configured" }, { status: 200 });
  }

  if (!verifyXSignature(params, xSignatureKey)) {
    // Invalid signature — do not trust this payload. Respond 200 so Billplz
    // doesn't keep retrying a forged/malformed request, but take no action.
    return NextResponse.json({ error: "Invalid signature" }, { status: 200 });
  }

  const billId = params.id;
  const isPaid = params.paid === "true" || params.paid === "1";

  if (!billId) {
    return NextResponse.json({ error: "Missing bill id" }, { status: 200 });
  }

  const supabase = createServiceClient();

  const { data: submission } = await supabase
    .from("report_submissions")
    .select("id, payment_status, reference_code")
    .eq("billplz_bill_id", billId)
    .maybeSingle();

  if (!submission) {
    // Unknown bill id — acknowledge, nothing to update.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (isPaid && submission.payment_status !== "paid") {
    await supabase
      .from("report_submissions")
      .update({
        payment_status: "paid",
        billplz_paid_at: params.paid_at ? new Date(params.paid_at).toISOString() : new Date().toISOString(),
      })
      .eq("id", submission.id);

    await logAudit(supabase, {
      actor: "billplz-webhook",
      action: "payment_confirmed",
      target_table: "report_submissions",
      target_id: submission.id,
      old_value: submission.payment_status,
      new_value: "paid",
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
