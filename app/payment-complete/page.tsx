import { createServiceClient } from "@/lib/supabase/service";

// Landing page the customer's browser is redirected to after Billplz
// checkout. This is display-only — the actual payment_status flip happens
// server-to-server via the verified webhook at /api/billplz/callback, which
// may land a moment before or after this page loads.
export default async function PaymentCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  let paid = false;
  let found = false;

  if (ref) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("report_submissions")
      .select("payment_status")
      .eq("reference_code", ref)
      .maybeSingle();

    if (data) {
      found = true;
      paid = data.payment_status === "paid" || data.payment_status === "waived";
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-sm font-semibold text-teal-700">HealthLens</p>
      {paid ? (
        <>
          <h1 className="text-2xl font-bold text-neutral-900">Payment received</h1>
          <p className="mt-3 text-neutral-600">
            Thank you{ref ? ` — reference ${ref}` : ""}. Your report will be emailed to you shortly.
          </p>
        </>
      ) : found ? (
        <>
          <h1 className="text-2xl font-bold text-neutral-900">Payment processing</h1>
          <p className="mt-3 text-neutral-600">
            We&apos;re confirming your payment{ref ? ` for reference ${ref}` : ""}. This usually takes
            just a moment — if you don&apos;t receive your report within a few minutes, please contact us.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-neutral-900">Thank you</h1>
          <p className="mt-3 text-neutral-600">
            Your payment is being processed. You&apos;ll receive your report by email once confirmed.
          </p>
        </>
      )}
    </main>
  );
}
