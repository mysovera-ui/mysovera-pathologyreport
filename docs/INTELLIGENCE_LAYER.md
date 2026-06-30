# Intelligence Layer

## Messy Input
Customer uploads a PDF or image of a lab report. They may also type free text describing their concern (e.g. "my LDL was 4.8, doctor said borderline").

## Auto-Structure Schema (v1 rule-based)
```json
{
  "report_type": "cholesterol",
  "markers_detected": ["LDL", "HDL", "Total Cholesterol", "Triglycerides"],
  "risk_flags": ["LDL elevated"],
  "plain_language_draft": "Your LDL (bad cholesterol) is above the recommended level...",
  "source": "rule-based-v1",
  "confidence": 0.80,
  "review_status": "unreviewed"
}
```

## Events to Track
- Submission created
- Status changed (each transition)
- AI draft generated
- Team edits draft
- PDF delivered
- Feedback submitted

## Scoring Rules (rule-based first)
- Report flagged urgent if: HbA1c > 6.5, LDL > 5.0, creatinine flagged HIGH, TSH outside 0.4–4.0
- Urgency score 0–10 based on number of out-of-range markers
- Priority queue: urgent submissions surfaced at top of team dashboard

## v1 vs Later
**v1:** Team manually enters key marker values; rule-based engine generates plain-language snippet per marker; stored as draft for team to edit.
**Later:** OCR + LLM auto-extracts markers from uploaded PDF; confidence scored per extraction; team reviews flagged low-confidence fields only.
