export type ReportType =
  | "cholesterol"
  | "HbA1c"
  | "liver"
  | "kidney"
  | "thyroid"
  | "FBC"
  | "other";

export type ReportStatus = "received" | "reviewing" | "completed" | "delivered";
export type PaymentStatus = "unpaid" | "paid" | "waived";
export type ReviewStatus = "unreviewed" | "approved" | "edited" | "rejected";

export interface ReportSubmission {
  id: string;
  user_id: string | null;
  created_at: string;
  customer_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  health_concern: string | null;
  report_type: ReportType | string | null;
  file_url: string | null;
  symptoms_notes: string | null;
  payment_status: PaymentStatus;
  report_status: ReportStatus;
  reference_code: string;
  submitted_at: string;
  delivered_at: string | null;
  follow_up_interest: boolean;
  ai_summary_draft: string | null;
  ai_summary_source: string | null;
  ai_summary_confidence: number | null;
  ai_summary_review_status: ReviewStatus;
  marker_input: string | null;
  urgency_score: number | null;
  ai_risk_flags: string | null;
  report_panels: string[] | null;
  ai_structured_result: unknown | null;
  generated_pdf_url: string | null;
  generated_pdf_generated_at: string | null;
}

export interface ReportDelivery {
  id: string;
  created_at: string;
  submission_id: string;
  pdf_url: string | null;
  delivered_by: string | null;
  delivery_notes: string | null;
  delivered_at: string;
}

export interface CustomerFeedback {
  id: string;
  created_at: string;
  submission_id: string;
  rating: number | null;
  feedback_text: string | null;
  follow_up_interest: boolean;
  submitted_at: string;
}

export interface AuditLog {
  id: string;
  created_at: string;
  actor: string;
  action: string;
  target_table: string;
  target_id: string;
  old_value: string | null;
  new_value: string | null;
  logged_at: string;
}

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "cholesterol", label: "Cholesterol" },
  { value: "HbA1c", label: "HbA1c (Blood Sugar)" },
  { value: "liver", label: "Liver Function" },
  { value: "kidney", label: "Kidney Function" },
  { value: "thyroid", label: "Thyroid" },
  { value: "FBC", label: "Full Blood Count" },
  { value: "other", label: "Other" },
];
