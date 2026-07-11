import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { ConsultationForm } from "./consultation-form";

export const dynamic = "force-dynamic";

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const supabase = createServiceClient();

  const { data: submission } = await supabase
    .from("report_submissions")
    .select("id, reference_code, customer_name, email")
    .eq("reference_code", ref)
    .maybeSingle();

  if (!submission) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center bg-white rounded-xl border border-neutral-200 p-6 sm:p-10">
          <h1 className="text-lg font-semibold text-neutral-900">Reference not found</h1>
          <p className="mt-2 text-sm text-neutral-600">
            We couldn&apos;t find a submission for &ldquo;{ref}&rdquo;. Double-check your reference number.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-teal-700 hover:underline">
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  const { data: existingRequest } = await supabase
    .from("consultation_requests")
    .select("id, consultation_type, status")
    .eq("submission_id", submission.id)
    .order("created_at", { ascending: false })
    .maybeSingle();

  return (
    <main className="min-h-screen bg-neutral-50 py-16 px-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Request a consultation</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Want a nutritionist or doctor to walk through your results with you? Let us know and our team will
          arrange a time.
        </p>
        <p className="mt-1 text-xs text-neutral-400 font-mono">{submission.reference_code}</p>

        <div className="mt-8">
          {existingRequest ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600">
              You&apos;ve already requested a consultation ({existingRequest.consultation_type}) for this report —
              status: <span className="font-medium">{existingRequest.status}</span>. Our team will be in touch.
            </div>
          ) : (
            <ConsultationForm
              submissionId={submission.id}
              referenceCode={submission.reference_code}
              defaultName={submission.customer_name}
              defaultEmail={submission.email}
            />
          )}
        </div>
      </div>
    </main>
  );
}
