"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitReportAction, type SubmitFormState } from "./actions";
import { REPORT_TYPES } from "@/lib/db/types";

const initialState: SubmitFormState = {};

export default function SubmitPage() {
  const [state, formAction, pending] = useActionState(
    submitReportAction,
    initialState,
  );

  return (
    <main className="min-h-screen bg-neutral-50 py-16 px-6">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          Submit your report
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Fill in your details and upload your lab report. We&apos;ll be in
          touch within 24–48 hours.
        </p>

        {state.error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-5">
          <Field label="Full name" error={state.fieldErrors?.customer_name}>
            <input
              name="customer_name"
              type="text"
              required
              className="input"
              placeholder="Jane Doe"
            />
          </Field>

          <Field label="Email" error={state.fieldErrors?.email}>
            <input
              name="email"
              type="email"
              required
              className="input"
              placeholder="jane@example.com"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Age">
              <input name="age" type="number" min={0} max={120} className="input" />
            </Field>
            <Field label="Gender">
              <select name="gender" className="input">
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>

          <Field label="Report type" error={state.fieldErrors?.report_type}>
            <select name="report_type" required className="input" defaultValue="">
              <option value="" disabled>
                Select a report type
              </option>
              {REPORT_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="What's your health concern?"
            error={state.fieldErrors?.health_concern}
          >
            <textarea
              name="health_concern"
              required
              rows={3}
              className="input"
              placeholder="e.g. My cholesterol came back high and I'm not sure what LDL means"
            />
          </Field>

          <Field label="Any symptoms or extra notes? (optional)">
            <textarea name="symptoms_notes" rows={2} className="input" />
          </Field>

          <Field label="Upload your report (PDF or image, max 10MB)">
            <input
              name="file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-teal-700 file:text-white file:px-3 file:py-1.5 file:text-sm"
            />
          </Field>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-teal-700 px-6 py-3 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 transition-colors"
          >
            {pending ? "Submitting…" : "Submit report"}
          </button>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgb(212 212 212);
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.9rem;
          background: white;
        }
        .input:focus {
          outline: 2px solid rgb(15 118 110);
          outline-offset: 1px;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
