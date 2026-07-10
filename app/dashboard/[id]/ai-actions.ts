"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/db/audit";
import { generateStructuredReport, renderReportText } from "@/lib/ai/rules";
import { extractMarkersFromFiles } from "@/lib/ai/extract-markers";
import { revalidatePath } from "next/cache";
import type { ReviewStatus } from "@/lib/db/types";

export type AiActionState = { error?: string };

export type ExtractActionState = { error?: string; markerText?: string; filesProcessed?: number };

export async function extractMarkersAction(submissionId: string): Promise<ExtractActionState> {
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("report_submissions")
    .select("file_urls, file_url")
    .eq("id", submissionId)
    .single();

  const fileUrls =
    submission?.file_urls && submission.file_urls.length > 0
      ? submission.file_urls
      : submission?.file_url
        ? [submission.file_url]
        : [];

  if (fileUrls.length === 0) {
    return { error: "No uploaded file found on this submission." };
  }

  let result;
  try {
    result = await extractMarkersFromFiles(fileUrls);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "ANTHROPIC_NOT_CONFIGURED") {
      return { error: "Automatic file analysis isn't set up yet — please enter markers manually below." };
    }
    console.error("extractMarkersFromFiles error", err);
    return { error: `Could not analyze the uploaded file(s): ${message}` };
  }

  const { error } = await supabase
    .from("report_submissions")
    .update({ marker_input: result.markerText })
    .eq("id", submissionId);

  if (error) {
    return { error: "Extraction succeeded but saving the result failed. Please try again." };
  }

  await logAudit(supabase, {
    actor: "system",
    action: "markers_extracted_from_file",
    target_table: "report_submissions",
    target_id: submissionId,
    new_value: `filesProcessed=${result.filesProcessed}`,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return { markerText: result.markerText, filesProcessed: result.filesProcessed };
}

export async function generateAiDraftAction(
  submissionId: string,
  _prevState: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const markerInput = String(formData.get("marker_input") || "").trim();

  if (!markerInput) {
    return { error: "Please enter at least one marker value." };
  }

  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("report_submissions")
    .select("customer_name")
    .eq("id", submissionId)
    .single();

  const report = generateStructuredReport(markerInput, {
    customerName: submission?.customer_name ?? undefined,
  });

  if (report.markersDetected.length === 0) {
    return { error: "None of those markers were recognized. Check the format is like 'LDL: 4.8, HbA1c: 6.1'." };
  }

  const draftText = renderReportText(report, submission?.customer_name ?? undefined);

  const { error } = await supabase
    .from("report_submissions")
    .update({
      marker_input: markerInput,
      ai_summary_draft: draftText,
      ai_summary_source: "rule-based-v1",
      ai_summary_confidence: report.confidence,
      ai_summary_review_status: "unreviewed",
      urgency_score: report.urgencyScore,
      ai_risk_flags: report.riskFlags.join(", ") || null,
      ai_structured_result: report,
      // Regenerating the draft invalidates any previously generated PDF —
      // the coach should regenerate the PDF from the fresh draft.
      generated_pdf_url: null,
      generated_pdf_generated_at: null,
    })
    .eq("id", submissionId);

  if (error) {
    return { error: "Something went wrong generating the draft. Please try again." };
  }

  await logAudit(supabase, {
    actor: "system",
    action: "ai_draft_generated",
    target_table: "report_submissions",
    target_id: submissionId,
    old_value: null,
    new_value: `overallRisk=${report.overallRisk}, urgency=${report.urgencyScore}`,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return {};
}

export async function saveDraftEditAction(
  submissionId: string,
  newText: string,
): Promise<AiActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("report_submissions")
    .update({
      ai_summary_draft: newText,
      ai_summary_review_status: "edited" as ReviewStatus,
    })
    .eq("id", submissionId);

  if (error) return { error: "Could not save your edit." };

  await logAudit(supabase, {
    actor: "healthbridge-team",
    action: "ai_draft_edited",
    target_table: "report_submissions",
    target_id: submissionId,
    new_value: "edited",
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return {};
}

export async function setReviewStatusAction(
  submissionId: string,
  status: ReviewStatus,
): Promise<AiActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("report_submissions")
    .update({ ai_summary_review_status: status })
    .eq("id", submissionId);

  if (error) return { error: "Could not update review status." };

  await logAudit(supabase, {
    actor: "healthbridge-team",
    action: "ai_draft_review_status_changed",
    target_table: "report_submissions",
    target_id: submissionId,
    new_value: status,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return {};
}
