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
  consultationUrl,
}: {
  customerName: string;
  referenceCode: string;
  pdfUrl: string;
  deliveredBy: string;
  feedbackUrl: string;
  consultationUrl?: string;
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
    ${consultationUrl ? `
    <p style="margin-top: 20px;">
      Want a nutritionist or doctor to walk through your results with you? —
      <a href="${consultationUrl}" style="color:#0F766E;">request a consultation</a>.
    </p>` : ""}
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
  consultationUrl?: string;
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

export function referringDoctorReportEmailHtml({
  doctorName,
  customerName,
  referenceCode,
  pdfUrl,
}: {
  doctorName: string;
  customerName: string;
  referenceCode: string;
  pdfUrl: string;
}): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1F2937;">
    <p style="color:#0F766E; font-weight:600; margin-bottom: 4px;">Health Bridge Solution</p>
    <h2 style="margin-top: 0;">Health report for your patient, ${doctorName}</h2>
    <p>
      Your patient <strong>${customerName}</strong> asked us to share their plain-language health summary
      (reference <strong>${referenceCode}</strong>) with you, as the referring doctor for this test.
    </p>
    <p>
      <a href="${pdfUrl}" style="display:inline-block; background:#0F766E; color:#fff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600;">
        Download the report
      </a>
    </p>
    <p style="color:#6B7280; font-size: 14px;">
      This is an educational summary generated to help the patient understand their results in plain language —
      not a substitute for your own clinical review of the underlying lab report.
    </p>
    <p style="color:#9CA3AF; font-size: 12px; margin-top: 32px;">
      Health Bridge Solution
    </p>
  </div>`;
}

export async function sendReferringDoctorReportEmail(opts: {
  to: string;
  doctorName: string;
  customerName: string;
  referenceCode: string;
  pdfUrl: string;
}) {
  const resend = getClient();
  const html = referringDoctorReportEmailHtml(opts);
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.to,
    subject: `Health report for your patient (${opts.referenceCode})`,
    html,
  });
  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return data;
}

const TEAM_NOTIFICATION_EMAIL = process.env.TEAM_NOTIFICATION_EMAIL || "mysovera@gmail.com";

export function consultationRequestConfirmationHtml({
  customerName,
  referenceCode,
  consultationType,
}: {
  customerName: string;
  referenceCode: string;
  consultationType: string;
}): string {
  const firstName = customerName.split(" ")[0];
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1F2937;">
    <p style="color:#0F766E; font-weight:600; margin-bottom: 4px;">Health Bridge Solution</p>
    <h2 style="margin-top: 0;">We've got your request, ${firstName}</h2>
    <p>
      Thanks for requesting a <strong>${consultationType}</strong> consultation (reference <strong>${referenceCode}</strong>).
      Our team will reach out to you by email or phone shortly to arrange a time.
    </p>
    <p style="color:#6B7280; font-size: 14px;">
      This is a request, not a confirmed booking yet — a real person from our team will follow up with you directly.
    </p>
    <p style="color:#9CA3AF; font-size: 12px; margin-top: 32px;">
      Health Bridge Solution
    </p>
  </div>`;
}

export async function sendConsultationRequestConfirmation(opts: {
  to: string;
  customerName: string;
  referenceCode: string;
  consultationType: string;
}) {
  const resend = getClient();
  const html = consultationRequestConfirmationHtml(opts);
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: opts.to,
    subject: `We've received your consultation request (${opts.referenceCode})`,
    html,
  });
  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return data;
}

export function consultationRequestTeamAlertHtml({
  customerName,
  referenceCode,
  email,
  phone,
  consultationType,
  preferredTime,
  notes,
}: {
  customerName: string;
  referenceCode: string;
  email: string;
  phone?: string | null;
  consultationType: string;
  preferredTime?: string | null;
  notes?: string | null;
}): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1F2937;">
    <p style="color:#0F766E; font-weight:600; margin-bottom: 4px;">New consultation request</p>
    <h2 style="margin-top: 0;">${customerName} (${referenceCode})</h2>
    <p><strong>Type:</strong> ${consultationType}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
    ${preferredTime ? `<p><strong>Preferred time:</strong> ${preferredTime}</p>` : ""}
    ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
    <p style="color:#6B7280; font-size: 14px; margin-top: 24px;">
      Manage this in the dashboard under Consultations.
    </p>
  </div>`;
}

export async function sendConsultationRequestTeamAlert(opts: {
  customerName: string;
  referenceCode: string;
  email: string;
  phone?: string | null;
  consultationType: string;
  preferredTime?: string | null;
  notes?: string | null;
}) {
  const resend = getClient();
  const html = consultationRequestTeamAlertHtml(opts);
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: TEAM_NOTIFICATION_EMAIL,
    subject: `New consultation request from ${opts.customerName} (${opts.referenceCode})`,
    html,
  });
  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return data;
}
