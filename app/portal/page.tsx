import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUS_STYLES, PAYMENT_STYLES, formatDate } from "@/lib/db/format";
import { TIER_LABELS } from "@/lib/billplz/pricing";
import { portalLogoutAction } from "./actions";
import type { ReportTier } from "@/lib/db/types";

export const dynamic = "force-dynamic";

interface PortalSubmission {
  id: string;
  reference_code: string;
  submitted_at: string;
  report_status: string;
  payment_status: string;
  generated_pdf_url: string | null;
  report_tier: ReportTier;
}

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already gates /portal on having a session, but a server
  // component render can race a just-expired cookie -- fail safe rather
  // than rendering an empty/broken page.
  if (!user?.email) {
    redirect("/portal/login");
  }

  // The customers_read_own_submissions RLS policy (migration 0018) already
  // restricts this to the logged-in user's own rows; the .eq below is just
  // an explicit, defense-in-depth filter on top of that.
  const { data: submissions } = await supabase
    .from("report_submissions")
    .select("id, reference_code, submitted_at, report_status, payment_status, generated_pdf_url, report_tier")
    .eq("email", user.email)
    .order("submitted_at", { ascending: false })
    .returns<PortalSubmission[]>();

  const rows = submissions ?? [];

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-teal-700">Health Bridge Solution</p>
            <h1 className="mt-1 text-2xl font-bold text-neutral-900">My reports</h1>
            <p className="text-sm text-neutral-500">Signed in as {user.email}</p>
          </div>
          <form action={portalLogoutAction}>
            <button
              type="submit"
              className="text-sm text-neutral-500 hover:text-neutral-700 hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>

        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center text-neutral-500">
            <p>No reports found for this email yet.</p>
            <Link href="/submit" className="mt-2 inline-block text-sm text-teal-700 hover:underline">
              Submit a report →
            </Link>
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-4">
            {rows.map((s) => {
              const canDownload =
                (s.payment_status === "paid" || s.payment_status === "waived") && s.generated_pdf_url;
              return (
                <div key={s.id} className="rounded-xl border border-neutral-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-neutral-700">{s.reference_code}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Submitted {formatDate(s.submitted_at)} · {TIER_LABELS[s.report_tier] ?? s.report_tier}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[s.report_status] ?? "bg-neutral-100 text-neutral-700"}`}
                      >
                        {s.report_status}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STYLES[s.payment_status] ?? "bg-neutral-100 text-neutral-700"}`}
                      >
                        {s.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-3 text-sm">
                    {canDownload ? (
                      <a
                        href={s.generated_pdf_url!}
                        target="_blank"
                        className="font-medium text-teal-700 hover:underline"
                      >
                        Download report →
                      </a>
                    ) : (
                      <span className="text-neutral-400">
                        {s.payment_status === "unpaid"
                          ? "Report will be available once payment is confirmed"
                          : "Report not yet ready"}
                      </span>
                    )}
                    <Link href={`/feedback/${s.reference_code}`} className="text-neutral-500 hover:underline">
                      Leave feedback
                    </Link>
                    <Link href={`/consultation/${s.reference_code}`} className="text-neutral-500 hover:underline">
                      Request a consultation
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
