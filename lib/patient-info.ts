// Shared validation/normalization for patient identity fields (full legal
// name, age, gender, Malaysian NRIC) that are read off the uploaded lab
// report by the AI extraction step (lib/ai/extract-markers.ts) and can also
// be hand-corrected by staff in the dashboard (app/dashboard/[id]/ai-actions.ts).
// Both paths funnel through these same functions so "empty or invalid input
// becomes null" behaves identically regardless of source — and null is what
// the PDF (lib/pdf/report-document.tsx) renders as a blank cell.

export function normalizeFullName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v || /^unknown$/i.test(v)) return null;
  if (v.length < 2 || v.length > 120) return null;
  if (!/[a-zA-Z]/.test(v)) return null;
  return v;
}

export function normalizeAge(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  if (!str || /^unknown$/i.test(str)) return null;
  const match = str.match(/\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  if (Number.isNaN(n) || n <= 0 || n > 120) return null;
  return n;
}

export function normalizeGender(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (/^m(ale)?$/.test(v)) return "Male";
  if (/^f(emale)?$/.test(v)) return "Female";
  return null;
}

// Malaysian NRIC: 12 digits, conventionally displayed as YYMMDD-PB-###G.
// Accepts digits with or without dashes/spaces; rejects anything that
// doesn't resolve to exactly 12 digits (treated as "invalid" -> blank).
export function normalizeNric(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (/^unknown$/i.test(raw.trim())) return null;
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length !== 12) return null;
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
}
