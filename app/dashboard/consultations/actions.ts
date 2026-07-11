"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";
import type { FollowUpStatus } from "@/lib/db/types";

export type ConsultationActionState = { error?: string; success?: boolean };

async function currentStaffEmail(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? "healthbridge-team";
}

export async function updateConsultationStatusAction(
  requestId: string,
  nextStatus: FollowUpStatus,
): Promise<ConsultationActionState> {
  const supabase = createServiceClient();
  const actor = await currentStaffEmail();

  const { data: current } = await supabase
    .from("consultation_requests")
    .select("status")
    .eq("id", requestId)
    .single();

  const { error } = await supabase
    .from("consultation_requests")
    .update({ status: nextStatus })
    .eq("id", requestId);

  if (error) {
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor,
    action: "consultation_status_changed",
    target_table: "consultation_requests",
    target_id: requestId,
    old_value: current?.status ?? null,
    new_value: nextStatus,
  });

  revalidatePath("/dashboard/consultations");
  return { success: true };
}

// Shares the same notes log used by the follow-ups page (keyed by
// submission_id) so staff see one unified contact history per customer,
// regardless of whether the note came from a follow-up or a consultation
// request.
export async function addConsultationNoteAction(
  submissionId: string,
  note: string,
): Promise<ConsultationActionState> {
  const trimmed = note.trim();
  if (!trimmed) {
    return { error: "Note can't be empty." };
  }

  const supabase = createServiceClient();
  const actor = await currentStaffEmail();

  const { error } = await supabase.from("follow_up_notes").insert({
    submission_id: submissionId,
    note: trimmed,
    author: actor,
  });

  if (error) {
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor,
    action: "consultation_note_added",
    target_table: "follow_up_notes",
    target_id: submissionId,
    new_value: trimmed,
  });

  revalidatePath("/dashboard/consultations");
  return { success: true };
}
