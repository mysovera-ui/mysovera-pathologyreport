import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { FeedbackForm } from "./feedback-form";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const supabase = createServiceClient();

  const { data: submission } = await supabase
    .from("report_submissions")
    .select("id, reference_code, customer_name, report_status")
    .eq("reference_code", ref)
    .maybeSingle();

  if (!submission) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center bg-white rounded-xl border border-neutral-200 p-6 sm:p-10">
          <h1 className="text-lg font-semibold text-neutral-900">
            Reference not found
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            We couldn&apos;t find a submission for &ldquo;{ref}&rdquo;. Double-check your
            reference number.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-teal-700 hover:underline">
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  const { data: existingFeedback } = await supabase
    .from("customer_feedback")
    .select("id")
    .eq("submission_id", submission.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-neutral-50 py-16 px-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          How did we do, {submission.customer_name.split(" ")[0]}?
        </h1>
        <p className="mt-1 text-sm text-neutral-500 font-mono">{submission.reference_code}</p>

        <div className="mt-8">
          {existingFeedback ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600">
              You&apos;ve already submitted feedback for this report. Thank you!
            </div>
          ) : (
            <FeedbackForm submissionId={submission.id} />
          )}
        </div>
      </div>
    </main>
  );
}
