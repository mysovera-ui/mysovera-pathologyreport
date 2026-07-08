"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/db/audit";
import { generateDraft } from "@/lib/ai/rules";
import { revalidatePath } from "next/cache";
import type { ReviewStatus } from "@/lib/db/types";

export type AiActionState = { error?: string };

export async function generateAiDraftAction(
  submissionId: string,
  _prevState: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const markerInput = String(formData.get("marker_input") || "").trim();

  if (!markerInput) {
    return { error: "Please enter at least one marker value." };
  }

  const result = generateDraft(markerInput);

  if (result.markersDetected.length === 0) {
    return { error: "Please enter at least one marker value." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("report_submissions")
    .update({
      marker_input: markerInput,
      ai_summary_draft: result.draft,
      ai_summary_source: "rule-based-v1",
      ai_summary_confidence: result.confidence,
      ai_summary_review_status: "unreviewed",
      urgency_score: result.urgencyScore,
      ai_risk_flags: result.riskFlags.join(", ") || null,
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
    new_value: `confidence=${result.confidence}, urgency=${result.urgencyScore}`,
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
