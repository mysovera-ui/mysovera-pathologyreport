"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitReportAction, type SubmitFormState } from "./actions";
import { PANEL_OPTIONS } from "@/lib/ai/rules";
import { createClient } from "@/lib/supabase/client";

const initialState: SubmitFormState = {};
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export default function SubmitPage() {
  const [state, formAction, pending] = useActionState(
    submitReportAction,
    initialState,
  );
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileStatus, setFileStatus] = useState<
    { kind: "idle" } | { kind: "uploading" } | { kind: "done"; name: string } | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setFileUrl("");
      setFileStatus({ kind: "idle" });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileStatus({ kind: "error", message: "That file is larger than 10MB. Please choose a smaller file." });
      e.target.value = "";
      setFileUrl("");
      return;
    }
    setFileStatus({ kind: "uploading" });
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("report-files")
      .upload(path, file, { contentType: file.type || undefined });

    if (error) {
      console.error("upload error", error);
      setFileStatus({ kind: "error", message: "Something went wrong uploading your file. Please try again." });
      setFileUrl("");
      return;
    }
    const { data } = supabase.storage.from("report-files").getPublicUrl(path);
    setFileUrl(data.publicUrl);
    setFileStatus({ kind: "done", name: file.name });
  }

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

          <Field
            label="Which panels does your report cover? (select all that apply)"
            error={state.fieldErrors?.report_panels}
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-neutral-300 bg-white p-3">
              {PANEL_OPTIONS.map((p) => (
                <label key={p.value} className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" name="report_panels" value={p.value} className="rounded" />
                  {p.label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Not sure? Just tick &ldquo;Other / Not Sure&rdquo; — our team will confirm from your uploaded report.
            </p>
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
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-teal-700 file:text-white file:px-3 file:py-1.5 file:text-sm"
            />
            <input type="hidden" name="file_url" value={fileUrl} />
            {fileStatus.kind === "uploading" && (
              <span className="mt-1 block text-xs text-neutral-500">Uploading…</span>
            )}
            {fileStatus.kind === "done" && (
              <span className="mt-1 block text-xs text-teal-700">✓ {fileStatus.name} uploaded</span>
            )}
            {fileStatus.kind === "error" && (
              <span className="mt-1 block text-xs text-red-600">{fileStatus.message}</span>
            )}
          </Field>

          <button
            type="submit"
            disabled={pending || fileStatus.kind === "uploading"}
            className="w-full rounded-lg bg-teal-700 px-6 py-3 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 transition-colors"
          >
            {pending ? "Submitting…" : fileStatus.kind === "uploading" ? "Uploading file…" : "Submit report"}
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
