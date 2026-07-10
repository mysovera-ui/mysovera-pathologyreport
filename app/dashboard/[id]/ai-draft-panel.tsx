"use client";

import { useActionState, useState, useTransition } from "react";
import {
  generateAiDraftAction,
  saveDraftEditAction,
  setReviewStatusAction,
  extractMarkersAction,
  type AiActionState,
} from "./ai-actions";
import { generatePdfAction } from "./pdf-actions";
import type { ReportSubmission } from "@/lib/db/types";

const initialState: AiActionState = {};

const REVIEW_BADGE: Record<string, string> = {
  unreviewed: "bg-neutral-100 text-neutral-600",
  approved: "bg-green-100 text-green-700",
  edited: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

export function AiDraftPanel({ submission }: { submission: ReportSubmission }) {
  const boundGenerate = generateAiDraftAction.bind(null, submission.id);
  const [state, formAction, pending] = useActionState(boundGenerate, initialState);
  const [draftText, setDraftText] = useState(submission.ai_summary_draft ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [isGeneratingPdf, startGeneratingPdf] = useTransition();
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [markerInput, setMarkerInput] = useState(submission.marker_input ?? "");
  const [clinicalHistory, setClinicalHistory] = useState(submission.clinical_history ?? "");
  const [isExtracting, startExtracting] = useTransition();
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractInfo, setExtractInfo] = useState<string | null>(null);

  const hasUploadedFile =
    (submission.file_urls && submission.file_urls.length > 0) || !!submission.file_url;

  function handleExtract() {
    setExtractError(null);
    setExtractInfo(null);
    startExtracting(async () => {
      const result = await extractMarkersAction(submission.id);
      if (result.error) {
        setExtractError(result.error);
        return;
      }
      if (result.markerText) {
        setMarkerInput(result.markerText);
      }
      if (result.clinicalHistory) {
        setClinicalHistory(result.clinicalHistory);
      }
      setExtractInfo(
        `Extracted from ${result.filesProcessed} file${result.filesProcessed === 1 ? "" : "s"}${
          result.clinicalHistory ? " — including a clinical history summary" : ""
        } — review below, then generate the draft.`,
      );
    });
  }

  const urgency = submission.urgency_score ?? 0;
  const urgencyColor =
    urgency >= 6 ? "text-red-600" : urgency >= 3 ? "text-amber-600" : "text-green-600";

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-900">AI summary draft</h2>
        {submission.urgency_score !== null && (
          <span className={`text-sm font-semibold ${urgencyColor}`}>
            Urgency {urgency}/10
          </span>
        )}
      </div>

      <div className="mb-3">
        <button
          type="button"
          onClick={handleExtract}
          disabled={isExtracting || !hasUploadedFile}
          className="rounded-lg bg-teal-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {isExtracting ? "Analyzing uploaded file…" : "Extract from uploaded file(s)"}
        </button>
        {!hasUploadedFile && (
          <span className="ml-2 text-xs text-neutral-400">No uploaded file on this submission.</span>
        )}
        {extractError && <p className="mt-1 text-xs text-red-600">{extractError}</p>}
        {extractInfo && <p className="mt-1 text-xs text-teal-700">{extractInfo}</p>}
      </div>

      <form action={formAction} className="space-y-2">
        <label className="block text-xs font-medium text-neutral-600">
          Marker values — extracted automatically from the uploaded file above, or enter/edit
          manually (e.g. LDL: 3.59, HbA1c: 5.8, TSH: 4.99, ESR: 22, Vitamin D: 60).
        </label>
        <textarea
          name="marker_input"
          rows={4}
          value={markerInput}
          onChange={(e) => setMarkerInput(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />

        <label className="block text-xs font-medium text-neutral-600 pt-2">
          Clinical history (optional) — from a discharge summary, clinic letter, or imaging
          report among the uploaded files, if any. Shown in the report as reported by the
          treating doctor, not as our own analysis.
        </label>
        <textarea
          name="clinical_history"
          rows={3}
          value={clinicalHistory}
          onChange={(e) => setClinicalHistory(e.target.value)}
          placeholder="e.g. Per discharge summary: C5/C6 and C6/C7 cervical disc prolapse with radiculopathy; acute migraine. Follow-up with orthopaedic surgeon."
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />

        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Generating…" : "Generate draft"}
        </button>
      </form>

      {submission.ai_summary_draft && (
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${REVIEW_BADGE[submission.ai_summary_review_status] ?? "bg-neutral-100"}`}
            >
              {submission.ai_summary_review_status}
            </span>
            <span className="text-xs text-neutral-400">
              {submission.ai_summary_source} · confidence{" "}
              {submission.ai_summary_confidence != null
                ? Math.round(submission.ai_summary_confidence * 100)
                : "—"}
              %
            </span>
          </div>

          {submission.ai_risk_flags && (
            <p className="text-xs text-red-600 mb-2">⚠ {submission.ai_risk_flags}</p>
          )}

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                rows={5}
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  disabled={isSaving}
                  onClick={() =>
                    startSaving(async () => {
                      await saveDraftEditAction(submission.id, draftText);
                      setIsEditing(false);
                    })
                  }
                  className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800"
                >
                  Save edit
                </button>
                <button
                  onClick={() => {
                    setDraftText(submission.ai_summary_draft ?? "");
                    setIsEditing(false);
                  }}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-800 whitespace-pre-wrap">
              {submission.ai_summary_draft}
            </p>
          )}

          {!isEditing && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Edit
              </button>
              <button
                disabled={isSaving}
                onClick={() =>
                  startSaving(async () => {
                    await setReviewStatusAction(submission.id, "approved");
                  })
                }
                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
              >
                Approve
              </button>
              <button
                disabled={isSaving}
                onClick={() =>
                  startSaving(async () => {
                    await setReviewStatusAction(submission.id, "rejected");
                  })
                }
                className="rounded-md border border-red-300 text-red-700 px-3 py-1.5 text-xs font-semibold hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          )}

          <div className="mt-4 border-t border-neutral-100 pt-4">
            <div className="flex items-center gap-2">
              <button
                disabled={isGeneratingPdf}
                onClick={() => {
                  setPdfError(null);
                  startGeneratingPdf(async () => {
                    const result = await generatePdfAction(submission.id);
                    if (result.error) setPdfError(result.error);
                  });
                }}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
              >
                {isGeneratingPdf
                  ? "Generating PDF…"
                  : submission.generated_pdf_url
                  ? "Regenerate branded PDF"
                  : "Generate branded PDF"}
              </button>
              {submission.generated_pdf_url && (
                <a
                  href={submission.generated_pdf_url}
                  target="_blank"
                  className="text-xs text-teal-700 hover:underline"
                >
                  View generated PDF →
                </a>
              )}
            </div>
            {pdfError && <p className="mt-1 text-xs text-red-600">{pdfError}</p>}
            {submission.ai_summary_review_status === "unreviewed" && (
              <p className="mt-1 text-xs text-amber-600">
                Draft is unreviewed — approve or edit it above before sending this PDF to the customer.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
