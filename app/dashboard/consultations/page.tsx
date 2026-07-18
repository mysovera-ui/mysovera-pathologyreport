import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { ConsultationCard } from "./consultation-card";
import type { ConsultationRequest, FollowUpNote, FollowUpStatus } from "@/lib/db/types";

export const dynamic = "force-dynamic";

interface RequestRow extends ConsultationRequest {
  report_submissions: { reference_code: string; report_tier: string } | null;
}

const STATUS_ORDER: FollowUpStatus[] = ["new", "contacted", "scheduled", "done"];

export default async function ConsultationsPage() {
  const supabase = createServiceClient();

  const { data: requests, error } = await supabase
    .from("consultation_requests")
    .select("*, report_submissions(reference_code, report_tier)")
    .order("created_at", { ascending: false })
    .returns<RequestRow[]>();

  const rows = requests ?? [];
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
    const statusA = STATUS_ORDER.indexOf(a.status);
    const statusB = STATUS_ORDER.indexOf(b.status);
    if (statusA !== statusB) return statusA - statusB;
    // Premium-tier requests are fast-tracked -- surfaced first within the
    // same status group so staff reach for them before the general queue.
    const priorityA = a.report_submissions?.report_tier === "premium" ? 0 : 1;
    const priorityB = b.report_submissions?.report_tier === "premium" ? 0 : 1;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const openCount = rows.filter((r) => r.status !== "done").length;

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Consultation requests</h1>
          <p className="text-sm text-neutral-500">
            {rows.length} request{rows.length === 1 ? "" : "s"} for a nutritionist/doctor consultation ·{" "}
            {openCount} still open.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            Something went wrong loading consultation requests. Please try again.
          </div>
        )}

        {!error && sorted.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center text-neutral-500">
            No consultation requests yet.
          </div>
        )}

        {!error && sorted.length > 0 && (
          <div className="space-y-4">
            {sorted.map((r) => (
              <ConsultationCard
                key={r.id}
                requestId={r.id}
                submissionId={r.submission_id}
                referenceCode={r.report_submissions?.reference_code ?? "—"}
                customerName={r.customer_name}
                email={r.email}
                phone={r.phone}
                consultationType={r.consultation_type}
                preferredTime={r.preferred_time}
                notes={r.notes}
                status={r.status}
                createdAt={r.created_at}
                contactNotes={notesBySubmission.get(r.submission_id) ?? []}
                isPriority={r.report_submissions?.report_tier === "premium"}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
