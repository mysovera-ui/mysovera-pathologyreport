# Test Plan

## Success Scenario (end-to-end)
1. Open `/` — landing page loads, service description visible, CTA button present
2. Click CTA → `/submit` form loads
3. Fill all fields: name = "Test User", email = "test@example.com", age = 45, gender = Female, health concern = "My cholesterol is high", report type = cholesterol, upload a PDF file
4. Submit → confirmation screen shows reference code (e.g. REF-0005)
5. Open `/dashboard` → new submission appears at top with status badge "received"
6. Click submission → detail view shows all fields and uploaded file link
7. Click "Start Reviewing" → status changes to "reviewing", audit_log row created
8. Click "Mark Completed" → status changes to "completed"
9. Enter PDF URL, delivered_by name, notes → click "Mark Delivered"
10. Status → "delivered", report_deliveries row exists, delivered_at populated
11. Open `/feedback/REF-0005` → feedback form loads
12. Select rating 4, type feedback, tick follow-up interest → submit
13. Return to dashboard → feedback badge visible on submission
14. **All steps pass with real DB reads/writes confirmed in Supabase table view.**

## Empty State Tests
- `/dashboard` with zero submissions: shows "No submissions yet" message, not a blank page
- `/feedback/REF-9999` (non-existent ref): shows "Reference not found" message
- Submit form with missing required field: inline validation error, form does not submit

## Error Cases
- Upload file > 10MB: error message shown, submission not created
- Supabase insert fails (network): user sees "Something went wrong, please try again"
- Status update on already-delivered submission: button disabled or warning shown

## AI Draft Tests (Sprint 3)
- Generate draft with valid marker input: draft appears in panel within 5 seconds
- Generate draft with empty markers: shows "Please enter at least one marker value"
- Edit and save draft: review_status updates to 'edited', new value persists on page reload
