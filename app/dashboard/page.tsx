import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { STATUS_STYLES, PAYMENT_STYLES, formatDate } from "@/lib/db/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServiceClient();
  const { data: submissions, error } = await supabase
    .from("report_submissions")
    .select(
      "id, reference_code, customer_name, report_type, report_status, payment_status, submitted_at, ai_summary_review_status, urgency_score",
    )
    .order("urgency_score", { ascending: false, nullsFirst: false })
    .order("submitted_at", { ascending: false });

  const { data: feedbackRows } = await supabase
    .from("customer_feedback")
    .select("submission_id");
  const feedbackSet = new Set((feedbackRows ?? []).map((f) => f.submission_id));

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-sm text-teal-700 hover:underline">
              ← Home
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-neutral-900">
              Team dashboard
            </h1>
            <p className="text-sm text-neutral-500">
              All report submissions, newest first.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Link
              href="/dashboard/feedback"
              className="text-sm font-medium text-teal-700 hover:underline whitespace-nowrap"
            >
              View customer feedback →
            </Link>
            <Link
              href="/dashboard/follow-ups"
              className="text-sm font-medium text-teal-700 hover:underline whitespace-nowrap"
            >
              Follow-up requests →
            </Link>
            <Link
              href="/dashboard/consultations"
              className="text-sm font-medium text-teal-700 hover:underline whitespace-nowrap"
            >
              Consultation requests →
            </Link>
            <Link
              href="/dashboard/analytics"
              className="text-sm font-medium text-teal-700 hover:underline whitespace-nowrap"
            >
              Analytics →
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            Something went wrong loading submissions. Please try again.
          </div>
        )}

        {!error && (!submissions || submissions.length === 0) && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center text-neutral-500">
            No submissions yet.
          </div>
        )}

        {!error && submissions && submissions.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Report type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Urgency</th>
                  <th className="px-4 py-3 font-medium">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/${s.id}`}
                        className="font-mono text-teal-700 hover:underline"
                      >
                        {s.reference_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-900">
                      {s.customer_name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {s.report_type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[s.report_status] ?? "bg-neutral-100 text-neutral-700"}`}
                      >
                        {s.report_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STYLES[s.payment_status] ?? "bg-neutral-100 text-neutral-700"}`}
                      >
                        {s.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {formatDate(s.submitted_at)}
                    </td>
                    <td className="px-4 py-3">
                      {s.urgency_score ? (
                        <span
                          className={`font-semibold text-xs ${s.urgency_score >= 6 ? "text-red-600" : s.urgency_score >= 3 ? "text-amber-600" : "text-green-600"}`}
                        >
                          {s.urgency_score}/10
                        </span>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {feedbackSet.has(s.id) ? (
                        <span className="inline-block rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-xs font-medium">
                          ★ received
                        </span>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
