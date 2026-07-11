import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

interface SubmissionRow {
  id: string;
  submitted_at: string;
  payment_status: string;
  report_status: string;
  delivered_at: string | null;
}

const WEEKS_TO_SHOW = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diffToMonday);
  return start;
}

function formatWeekLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDuration(hours: number): string {
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

export default async function AnalyticsPage() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("report_submissions")
    .select("id, submitted_at, payment_status, report_status, delivered_at")
    .returns<SubmissionRow[]>();

  const submissions = data ?? [];

  // --- Submissions per week (last 12 weeks, oldest first) ---
  const thisWeekStart = startOfWeek(new Date());
  const weekBuckets: { label: string; start: number; end: number; count: number }[] = [];
  for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
    const start = new Date(thisWeekStart.getTime() - i * MS_PER_WEEK);
    const end = new Date(start.getTime() + MS_PER_WEEK);
    weekBuckets.push({ label: formatWeekLabel(start), start: start.getTime(), end: end.getTime(), count: 0 });
  }
  for (const s of submissions) {
    const t = new Date(s.submitted_at).getTime();
    const bucket = weekBuckets.find((b) => t >= b.start && t < b.end);
    if (bucket) bucket.count++;
  }
  const maxCount = Math.max(1, ...weekBuckets.map((b) => b.count));

  // --- Conversion rate: submitted -> paid ---
  const totalSubmissions = submissions.length;
  const paidCount = submissions.filter((s) => s.payment_status === "paid").length;
  const conversionRate = totalSubmissions > 0 ? (paidCount / totalSubmissions) * 100 : 0;

  // --- Average turnaround: submitted_at -> delivered_at, delivered only ---
  const delivered = submissions.filter((s) => s.report_status === "delivered" && s.delivered_at);
  const turnaroundHours = delivered.map(
    (s) => (new Date(s.delivered_at!).getTime() - new Date(s.submitted_at).getTime()) / (60 * 60 * 1000),
  );
  const avgTurnaroundHours =
    turnaroundHours.length > 0 ? turnaroundHours.reduce((a, b) => a + b, 0) / turnaroundHours.length : null;

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Analytics</h1>
          <p className="text-sm text-neutral-500">A quick pulse on volume, revenue conversion, and turnaround.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            Something went wrong loading analytics. Please try again.
          </div>
        )}

        {!error && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs font-medium text-neutral-500">Total submissions</p>
                <p className="mt-1 text-3xl font-bold text-neutral-900">{totalSubmissions}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs font-medium text-neutral-500">Conversion rate (submitted → paid)</p>
                <p className="mt-1 text-3xl font-bold text-neutral-900">{conversionRate.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-neutral-400">{paidCount} of {totalSubmissions} paid</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs font-medium text-neutral-500">Avg turnaround (submit → delivered)</p>
                <p className="mt-1 text-3xl font-bold text-neutral-900">
                  {avgTurnaroundHours !== null ? formatDuration(avgTurnaroundHours) : "—"}
                </p>
                <p className="mt-1 text-xs text-neutral-400">{delivered.length} delivered report{delivered.length === 1 ? "" : "s"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
              <p className="text-sm font-semibold text-neutral-900 mb-4">
                Submissions per week (last {WEEKS_TO_SHOW} weeks)
              </p>
              <div className="flex items-end gap-2 h-40">
                {weekBuckets.map((b) => (
                  <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-xs text-neutral-500 mb-1">{b.count || ""}</span>
                    <div
                      className="w-full rounded-t bg-teal-600"
                      style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: b.count > 0 ? "4px" : "0" }}
                    />
                    <span className="mt-2 text-[10px] text-neutral-400 whitespace-nowrap">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
