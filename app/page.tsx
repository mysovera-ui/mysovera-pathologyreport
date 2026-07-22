import Link from "next/link";

const REPORT_TYPES = [
  { label: "Cholesterol", desc: "LDL, HDL, triglycerides explained in plain terms" },
  { label: "HbA1c", desc: "Blood sugar & pre-diabetes/diabetes markers" },
  { label: "Liver Function", desc: "ALT, AST, bilirubin and what they mean" },
  { label: "Kidney Function", desc: "Creatinine, eGFR explained simply" },
  { label: "Thyroid", desc: "TSH, T3, T4 — over/underactive thyroid signs" },
  { label: "Full Blood Count", desc: "Haemoglobin, white cells, platelets" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-medium text-teal-700 mb-3">
          HealthLens
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">
          Understand your blood test results in plain English
        </h1>
        <p className="mt-5 text-lg text-neutral-600 max-w-xl mx-auto">
          Upload your lab report. A real person on our team turns your numbers
          into a plain-language summary you can actually understand — before
          you see your doctor. No diagnosis, just clarity.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/submit"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-teal-700 px-6 py-3 text-white font-semibold hover:bg-teal-800 transition-colors"
          >
            Submit your report
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-neutral-300 px-6 py-3 text-neutral-700 font-semibold hover:bg-neutral-100 transition-colors"
          >
            Team dashboard
          </Link>
        </div>
        <p className="mt-4 text-sm text-neutral-500">
          Reports delivered within 24–48 hours by email.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Submitted before?{" "}
          <Link href="/portal/login" className="text-teal-700 hover:underline">
            View your report history
          </Link>
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
          Report types we cover
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((r) => (
            <div
              key={r.label}
              className="rounded-xl border border-neutral-200 bg-white p-5"
            >
              <h3 className="font-semibold text-neutral-900">{r.label}</h3>
              <p className="mt-1 text-sm text-neutral-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="rounded-xl bg-teal-700 text-white p-8 text-center">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 text-teal-50 space-y-1 text-sm max-w-md mx-auto">
            <li>1. Fill in the form and upload your report</li>
            <li>2. Our team reviews it and prepares a plain-language summary</li>
            <li>3. You receive your PDF summary by email within 24–48 hours</li>
            <li>4. Tell us what you thought — and ask for a follow-up if you want one</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
