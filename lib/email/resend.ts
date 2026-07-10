import { Resend } from "resend";

// Server-side only. Never import this from a client component.
// If RESEND_API_KEY isn't set (not yet configured), sendDeliveryEmail
// throws a clear, catchable error instead of crashing at import time —
// mirrors how lib/stripe/index.ts used to guard build-time imports in
// this template.
function getClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }
  return new Resend(key);
}

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Health Bridge Solution <report@healthbridgesolution.my>";

export function deliveryEmailHtml({
  customerName,
  referenceCode,
  pdfUrl,
  deliveredBy,
  feedbackUrl,
}: {
  customerName: string;
  referenceCode: string;
  pdfUrl: string;
  deliveredBy: string;
  feedbackUrl: string;
}): string {
  const firstName = customerName.split(" ")[0];
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1F2937;">
    <p style="color:#0F766E; font-weight:600; margin-bottom: 4px;">Health Bridge Solution</p>
    <h2 style="margin-top: 0;">Your health report is ready, ${firstName}</h2>
    <p>Your plain-language health summary (reference <strong>${referenceCode}</strong>) has been reviewed and is ready for you.</p>
    <p>
      <a href="${pdfUrl}" style="display:inline-block; background:#0F766E; color:#fff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600;">
        Download your report
      </a>
    </p>
    <p style="color:#6B7280; font-size: 14px;">
      This is an educational summary, not a diagnosis. Please discuss these results with your doctor,
      especially before starting any supplement or treatment.
    </p>
    <p style="margin-top: 24px;">
      We'd love your feedback —
      <a href="${feedbackUrl}" style="color:#0F766E;">let us know how we did</a>.
    </p>
    <p style="color:#9CA3AF; font-size: 12px; margin-top: 32px;">
      Delivered by ${deliveredBy} · Health Bridge Solution
    </p>
  </div>`;
}

export async function sendDeliveryEmail(opts: {
  to: string;
  customerName: string;
  referenceCode: string;
  pdfUrl: string;
  deliveredBy: string;
  feedbackUrl: string;
}) {
  const resend = getClient();
  const html = deliveryEmailHtml(opts);
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.to,
    subject: `Your health report is ready (${opts.referenceCode})`,
    html,
  });
  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return data;
}

export function paymentRequestEmailHtml({
  customerName,
  referenceCode,
  paymentUrl,
  amountLabel,
}: {
  customerName: string;
  referenceCode: string;
  paymentUrl: string;
  amountLabel: string;
}): string {
  const firstName = customerName.split(" ")[0];
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1F2937;">
    <p style="color:#0F766E; font-weight:600; margin-bottom: 4px;">Health Bridge Solution</p>
    <h2 style="margin-top: 0;">Your health report is reviewed and ready, ${firstName}</h2>
    <p>Your plain-language health summary (reference <strong>${referenceCode}</strong>) has been reviewed by our team. Complete payment of <strong>${amountLabel}</strong> to receive your report by email.</p>
    <p>
      <a href="${paymentUrl}" style="display:inline-block; background:#0F766E; color:#fff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600;">
        Pay ${amountLabel} to unlock your report
      </a>
    </p>
    <p style="color:#6B7280; font-size: 14px;">
      Payment is processed securely via Billplz. Once payment is confirmed, your report will be sent to this email address automatically.
    </p>
    <p style="color:#9CA3AF; font-size: 12px; margin-top: 32px;">
      Health Bridge Solution
    </p>
  </div>`;
}

export async function sendPaymentRequestEmail(opts: {
  to: string;
  customerName: string;
  referenceCode: string;
  paymentUrl: string;
  amountLabel: string;
}) {
  const resend = getClient();
  const html = paymentRequestEmailHtml(opts);
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.to,
    subject: `Payment required to receive your health report (${opts.referenceCode})`,
    html,
  });
  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return data;
}
