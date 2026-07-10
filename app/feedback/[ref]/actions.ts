"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { logAudit } from "@/lib/db/audit";

export type FeedbackFormState = { error?: string; success?: boolean };

export async function submitFeedbackAction(
  submissionId: string,
  _prevState: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const ratingRaw = String(formData.get("rating") || "");
  const feedback_text = String(formData.get("feedback_text") || "").trim();
  const follow_up_interest = formData.get("follow_up_interest") === "on";

  const rating = parseInt(ratingRaw, 10);
  if (!rating || rating < 1 || rating > 5) {
    return { error: "Please select a rating from 1 to 5." };
  }

  const supabase = createServiceClient();

  const { error } = await supabase.from("customer_feedback").insert({
    submission_id: submissionId,
    rating,
    feedback_text: feedback_text || null,
    follow_up_interest,
  });

  if (error) {
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor: "system",
    action: "feedback_submitted",
    target_table: "customer_feedback",
    target_id: submissionId,
    new_value: `rating=${rating}`,
  });

  return { success: true };
}
