import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUS_STYLES, PAYMENT_STYLES, formatDateTime } from "@/lib/db/format";
import { StatusActions } from "./status-actions";
import { PaymentToggle } from "./payment-toggle";
import { DeliveryForm } from "./delivery-form";
import { AiDraftPanel } from "./ai-draft-panel";
import { SendEmailButton } from "./send-email-button";
import type { ReportStatus, PaymentStatus } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("report_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!submission) notFound();

  const [{ data: deliveries }, { data: feedback }, { data: auditLogs }] =
    await Promise.all([
      supabase
        .from("report_deliveries")
        .select("*")
        .eq("submission_id", id)
        .order("delivered_at", { ascending: false }),
      supabase
        .from("customer_feedback")
        .select("*")
        .eq("submission_id", id)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("audit_logs")
        .select("*")
        .eq("target_id", id)
        .order("logged_at", { ascending: false }),
    ]);

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">
          ← Dashboard
        </Link>

        <div className="mt-4 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 font-mono">
              {submission.reference_code}
            </h1>
            <p className="text-neutral-600">{submission.customer_name}</p>
          </div>
          <div className="flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[submission.report_status as ReportStatus] ?? "bg-neutral-100 text-neutral-700"}`}
            >
              {submission.report_status}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_STYLES[submission.payment_status as PaymentStatus] ?? "bg-neutral-100 text-neutral-700"}`}
            >
              {submission.payment_status}
            </span>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">Submission details</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Detail label="Email" value={submission.email} />
                <Detail label="Age" value={submission.age ?? "—"} />
                <Detail label="Gender" value={submission.gender ?? "—"} />
                <Detail label="Report type" value={submission.report_type ?? "—"} />
                <Detail label="Submitted" value={formatDateTime(submission.submitted_at)} />
                <Detail label="Delivered" value={formatDateTime(submission.delivered_at)} />
              </dl>
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-500 mb-1">Health concern</p>
                <p className="text-sm text-neutral-800">{submission.health_concern || "—"}</p>
              </div>
              {submission.symptoms_notes && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-neutral-500 mb-1">Symptoms / notes</p>
                  <p className="text-sm text-neutral-800">{submission.symptoms_notes}</p>
                </div>
              )}
              {submission.file_url && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-neutral-500 mb-1">Uploaded file</p>
                  <a
                    href={submission.file_url}
                    target="_blank"
                    className="text-sm text-teal-700 hover:underline break-all"
                  >
                    {submission.file_url}
                  </a>
                </div>
              )}
            </section>

            <AiDraftPanel submission={submission} />

            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="font-semibold text-neutral-900 mb-4">Status history</h2>
              {!auditLogs || auditLogs.length === 0 ? (
                <p className="text-sm text-neutral-400">No history yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {auditLogs.map((log) => (
                    <li key={log.id} className="flex justify-between border-b border-neutral-100 pb-2 last:border-0">
                      <span className="text-neutral-700">
                        <span className="font-medium">{log.actor}</span> — {log.action.replaceAll("_", " ")}
                        {log.old_value && log.new_value && (
                          <span className="text-neutral-400"> ({log.old_value} → {log.new_value})</span>
                        )}
                      </span>
                      <span className="text-neutral-400 text-xs">{formatDateTime(log.logged_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {feedback && feedback.length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-6">
                <h2 className="font-semibold text-neutral-900 mb-4">Customer feedback</h2>
                {feedback.map((f) => (
                  <div key={f.id} className="border-b border-neutral-100 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">{"★".repeat(f.rating ?? 0)}{"☆".repeat(5 - (f.rating ?? 0))}</span>
                      <span className="text-xs text-neutral-400">{formatDateTime(f.submitted_at)}</span>
                    </div>
                    {f.feedback_text && <p className="mt-1 text-sm text-neutral-700">{f.feedback_text}</p>}
                    {f.follow_up_interest && (
                      <p className="mt-1 text-xs text-teal-700 font-medium">Requested a follow-up consultation</p>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="font-semibold text-neutral-900 mb-3">Status</h2>
              <StatusActions
                submissionId={submission.id}
                status={submission.report_status as ReportStatus}
              />
            </section>

            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="font-semibold text-neutral-900 mb-3">Payment</h2>
              <PaymentToggle
                submissionId={submission.id}
                payment={submission.payment_status as PaymentStatus}
              />
            </section>

            {submission.report_status === "completed" && (
              <section className="rounded-xl border border-neutral-200 bg-white p-6">
                <h2 className="font-semibold text-neutral-900 mb-3">Deliver report</h2>
                <DeliveryForm submissionId={submission.id} defaultPdfUrl={submission.generated_pdf_url} />
              </section>
            )}

            {submission.report_status === "delivered" && deliveries && deliveries.length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-6">
                <h2 className="font-semibold text-neutral-900 mb-3">Delivery</h2>
                <p className="text-sm text-neutral-700 break-all">
                  <a href={deliveries[0].pdf_url ?? "#"} target="_blank" className="text-teal-700 hover:underline">
                    {deliveries[0].pdf_url}
                  </a>
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Delivered by {deliveries[0].delivered_by} on {formatDateTime(deliveries[0].delivered_at)}
                </p>
                {deliveries[0].delivery_notes && (
                  <p className="mt-2 text-xs text-neutral-600">{deliveries[0].delivery_notes}</p>
                )}
                <Link
                  href={`/feedback/${submission.reference_code}`}
                  className="mt-3 inline-block text-xs text-teal-700 hover:underline"
                >
                  Feedback link →
                </Link>
                <SendEmailButton
                  submissionId={submission.id}
                  customerEmail={submission.email}
                  emailSentAt={deliveries[0].email_sent_at}
                  emailSentTo={deliveries[0].email_sent_to}
                  emailSendError={deliveries[0].email_send_error}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  );
}
