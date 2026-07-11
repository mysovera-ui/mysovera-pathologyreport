"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";
import type { FollowUpStatus } from "@/lib/db/types";

export type FollowUpActionState = { error?: string; success?: boolean };

async function currentStaffEmail(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? "healthbridge-team";
}

export async function updateFollowUpStatusAction(
  submissionId: string,
  nextStatus: FollowUpStatus,
): Promise<FollowUpActionState> {
  const supabase = createServiceClient();
  const actor = await currentStaffEmail();

  const { data: current } = await supabase
    .from("report_submissions")
    .select("follow_up_status")
    .eq("id", submissionId)
    .single();

  const { error } = await supabase
    .from("report_submissions")
    .update({ follow_up_status: nextStatus })
    .eq("id", submissionId);

  if (error) {
    return { error: "Something went wrong, please try again." };
  }

  await logAudit(supabase, {
    actor,
    action: "follow_up_status_changed",
    target_table: "report_submissions",
    target_id: submissionId,
    old_value: current?.follow_up_status ?? null,
    new_value: nextStatus,
  });

  revalidatePath("/dashboard/follow-ups");
  return { success: true };
}

export async function addFollowUpNoteAction(
  submissionId: string,
  note: string,
): Promise<FollowUpActionState> {
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
    action: "follow_up_note_added",
    target_table: "follow_up_notes",
    target_id: submissionId,
    new_value: trimmed,
  });

  revalidatePath("/dashboard/follow-ups");
  return { success: true };
}
