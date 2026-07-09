import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/db/format";

export const dynamic = "force-dynamic";

interface FeedbackRow {
  id: string;
  submission_id: string;
  rating: number | null;
  feedback_text: string | null;
  follow_up_interest: boolean;
  submitted_at: string;
  report_submissions: {
    reference_code: string;
    customer_name: string;
    report_type: string;
  } | null;
}

export default async function FeedbackOverviewPage() {
  const supabase = await createClient();
  const { data: feedback, error } = await supabase
    .from("customer_feedback")
    .select(
      "id, submission_id, rating, feedback_text, follow_up_interest, submitted_at, report_submissions(reference_code, customer_name, report_type)",
    )
    .order("submitted_at", { ascending: false })
    .returns<FeedbackRow[]>();

  const rows = feedback ?? [];
  const ratedRows = rows.filter((f) => typeof f.rating === "number");
  const avgRating =
    ratedRows.length > 0
      ? ratedRows.reduce((sum, f) => sum + (f.rating ?? 0), 0) / ratedRows.length
      : null;
  const followUpCount = rows.filter((f) => f.follow_up_interest).length;

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">
            Customer feedback
          </h1>
          <p className="text-sm text-neutral-500">
            All feedback submitted by customers, newest first.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            Something went wrong loading feedback. Please try again.
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-xs text-neutral-500">Total responses</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {rows.length}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-xs text-neutral-500">Average rating</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {avgRating !== null ? avgRating.toFixed(1) : "—"}
                <span className="text-sm font-normal text-neutral-400"> / 5</span>
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-xs text-neutral-500">Requested follow-up</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {followUpCount}
              </p>
            </div>
          </div>
        )}

        {!error && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center text-neutral-500">
            No feedback received yet.
          </div>
        )}

        {!error && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Report type</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Comment</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/${f.submission_id}`}
                        className="font-mono text-teal-700 hover:underline"
                      >
                        {f.report_submissions?.reference_code ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-900">
                      {f.report_submissions?.customer_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {f.report_submissions?.report_type ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-500">
                        {"★".repeat(f.rating ?? 0)}
                        {"☆".repeat(5 - (f.rating ?? 0))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-700 max-w-xs">
                      {f.feedback_text || (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {f.follow_up_interest ? (
                        <span className="inline-block rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-xs font-medium">
                          Requested
                        </span>
                      ) : (
                        <span className="text-neutral-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                      {formatDateTime(f.submitted_at)}
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
