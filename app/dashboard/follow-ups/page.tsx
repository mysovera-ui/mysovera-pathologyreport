import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { FollowUpCard } from "./follow-up-card";
import type { FollowUpStatus, FollowUpNote } from "@/lib/db/types";

export const dynamic = "force-dynamic";

interface FeedbackRow {
  id: string;
  submission_id: string;
  rating: number | null;
  feedback_text: string | null;
  report_submissions: {
    id: string;
    reference_code: string;
    customer_name: string;
    report_type: string | null;
    follow_up_status: FollowUpStatus;
    submitted_at: string;
  } | null;
}

const STATUS_ORDER: FollowUpStatus[] = ["new", "contacted", "scheduled", "done"];

export default async function FollowUpsPage() {
  const supabase = createServiceClient();

  const { data: feedback, error } = await supabase
    .from("customer_feedback")
    .select(
      "id, submission_id, rating, feedback_text, report_submissions(id, reference_code, customer_name, report_type, follow_up_status, submitted_at)",
    )
    .eq("follow_up_interest", true)
    .order("submitted_at", { ascending: false })
    .returns<FeedbackRow[]>();

  const rows = (feedback ?? []).filter((f) => f.report_submissions !== null);
  const submissionIds = rows.map((r) => r.submission_id);

  const { data: notesData } = submissionIds.length
    ? await supabase
        .from("follow_up_notes")
        .select("id, submission_id, note, author, created_at")
        .in("submission_id", submissionIds)
        .order("created_at", { ascending: true })
        .returns<FollowUpNote[]>()
    : { data: [] as FollowUpNote[] };

  const notesBySubmission = new Map<string, FollowUpNote[]>();
  for (const note of notesData ?? []) {
    const list = notesBySubmission.get(note.submission_id) ?? [];
    list.push(note);
    notesBySubmission.set(note.submission_id, list);
  }

  const sorted = [...rows].sort((a, b) => {
    const statusA = STATUS_ORDER.indexOf(a.report_submissions!.follow_up_status);
    const statusB = STATUS_ORDER.indexOf(b.report_submissions!.follow_up_status);
    if (statusA !== statusB) return statusA - statusB;
    return (
      new Date(b.report_submissions!.submitted_at).getTime() -
      new Date(a.report_submissions!.submitted_at).getTime()
    );
  });

  const openCount = rows.filter(
    (r) => r.report_submissions!.follow_up_status !== "done",
  ).length;

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">
            Follow-up requests
          </h1>
          <p className="text-sm text-neutral-500">
            {rows.length} customer{rows.length === 1 ? "" : "s"} asked for a follow-up
            consultation · {openCount} still open.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            Something went wrong loading follow-ups. Please try again.
          </div>
        )}

        {!error && sorted.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center text-neutral-500">
            No follow-up requests yet.
          </div>
        )}

        {!error && sorted.length > 0 && (
          <div className="space-y-4">
            {sorted.map((row) => {
              const sub = row.report_submissions!;
              return (
                <FollowUpCard
                  key={row.submission_id}
                  submissionId={sub.id}
                  referenceCode={sub.reference_code}
                  customerName={sub.customer_name}
                  reportType={sub.report_type}
                  rating={row.rating}
                  feedbackText={row.feedback_text}
                  status={sub.follow_up_status}
                  notes={notesBySubmission.get(row.submission_id) ?? []}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
