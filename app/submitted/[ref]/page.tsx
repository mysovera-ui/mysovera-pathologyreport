import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";

export default async function SubmittedPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const supabase = createServiceClient();
  const { data: submission } = await supabase
    .from("report_submissions")
    .select("reference_code, customer_name, report_type")
    .eq("reference_code", ref)
    .maybeSingle();

  if (!submission) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center bg-white rounded-xl border border-neutral-200 p-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-xl font-bold text-neutral-900">
          Thanks, {submission.customer_name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Your report has been received. Expect your plain-language summary
          by email within 24–48 hours.
        </p>
        <div className="mt-6 rounded-lg bg-neutral-100 py-3">
          <p className="text-xs text-neutral-500">Your reference number</p>
          <p className="text-lg font-mono font-semibold text-neutral-900">
            {submission.reference_code}
          </p>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Once delivered, you can leave feedback at{" "}
          <code>/feedback/{submission.reference_code}</code>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-teal-700 hover:underline"
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
