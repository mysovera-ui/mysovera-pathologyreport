"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/db/audit";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument } from "@/lib/pdf/report-document";
import type { StructuredReport } from "@/lib/ai/rules";
import { revalidatePath } from "next/cache";
import React from "react";

export type PdfActionState = { error?: string };

export async function generatePdfAction(submissionId: string): Promise<PdfActionState> {
  const supabase = await createClient();

  const { data: submission, error: fetchError } = await supabase
    .from("report_submissions")
    .select(
      "customer_name, age, gender, reference_code, submitted_at, ai_structured_result, ai_summary_review_status, clinical_history",
    )
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    return { error: "Submission not found." };
  }
  if (!submission.ai_structured_result) {
    return { error: "Generate the AI draft first — there's nothing to turn into a PDF yet." };
  }

  let buffer: Buffer;
  try {
    const element = React.createElement(ReportDocument, {
      report: submission.ai_structured_result as StructuredReport,
      customerName: submission.customer_name,
      age: submission.age,
      gender: submission.gender,
      referenceCode: submission.reference_code,
      submittedAt: submission.submitted_at,
      reviewStatus: submission.ai_summary_review_status,
      clinicalHistory: submission.clinical_history,
    });
    buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);
  } catch (err) {
    console.error("pdf render error", err);
    return { error: "Something went wrong rendering the PDF. Please try again." };
  }

  const path = `${submission.reference_code}-${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("generated-reports")
    .upload(path, buffer, { contentType: "application/pdf" });

  if (uploadError) {
    console.error("pdf upload error", uploadError);
    return { error: "Something went wrong saving the PDF. Please try again." };
  }

  const { data: publicUrl } = supabase.storage.from("generated-reports").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("report_submissions")
    .update({
      generated_pdf_url: publicUrl.publicUrl,
      generated_pdf_generated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (updateError) {
    return { error: "PDF generated but failed to save its link. Please try again." };
  }

  await logAudit(supabase, {
    actor: "system",
    action: "pdf_generated",
    target_table: "report_submissions",
    target_id: submissionId,
    new_value: publicUrl.publicUrl,
  });

  revalidatePath(`/dashboard/${submissionId}`);
  return {};
}
