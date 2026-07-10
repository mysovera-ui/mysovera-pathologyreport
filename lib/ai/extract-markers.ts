import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
const MAX_FILES = 10;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_NOT_CONFIGURED");
  }
  return new Anthropic({ apiKey });
}

function guessMediaType(url: string, contentType: string | null): string {
  if (contentType && contentType !== "application/octet-stream") return contentType;
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/pdf";
}

async function fetchAsBase64(url: string): Promise<{ base64: string; mediaType: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not download uploaded file (HTTP ${res.status}).`);
  }
  const mediaType = guessMediaType(url, res.headers.get("content-type"));
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { base64, mediaType };
}

// Parameter names must match the regex patterns in lib/ai/rules.ts so the
// rule engine recognizes them. This list is given to the model verbatim so
// it uses consistent naming instead of inventing its own.
const KNOWN_PARAMETERS = `
Hematology: Haemoglobin, RBC, PCV, MCV, MCH, MCHC, RDW, WBC, Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils, Platelets, MPV, PDW, ESR
Diabetes: Glucose (fasting), HbA1c
Kidney: Sodium, Potassium, Chloride, Urea, Creatinine, eGFR, Uric Acid, Calcium, Phosphate
Liver/Biochemistry: Magnesium, Total Protein, Albumin, Globulin, A/G Ratio, ALP, Total Bilirubin, GGT, AST, ALT
Lipid: Total Cholesterol, Triglycerides, HDL, LDL, Non-HDL
Urinalysis (qualitative results should be "Negative"/"Positive"/"Trace"): Leukocytes, Blood, Nitrite, Ketones, Protein, Specific Gravity, pH
Thyroid: FT4, FT3, TSH
Tumor Markers: AFP, CEA, CA 125, CA 19-9, CA 15-3
H. pylori: H. pylori
Vitamin D: Vitamin D
Vitamin B12: Vitamin B12
Iron Studies: Serum Iron, Transferrin, TIBC, Saturation, Ferritin
Hormone: FSH, LH, Estradiol
`.trim();

const SYSTEM_PROMPT = `You are a meticulous medical lab report transcriber. You will be shown one or more pages/photos of a patient's pathology/lab report (possibly scanned or photographed, sometimes across multiple images for a multi-page report).

Your only job is to find every lab test result on the pages and output them as plain "Parameter: value" lines, one per line — nothing else. No headings, no commentary, no markdown, no bullet points.

Rules:
- Use the exact parameter names from this list whenever the test on the page matches one of them (case does not matter, but use these exact words):
${KNOWN_PARAMETERS}
- If a test on the page isn't in that list, still include it using the name printed on the report, in case it's useful, but prioritize accuracy over completeness.
- Only output the numeric or qualitative RESULT value, not the reference range (e.g. "HbA1c: 6.1" not "HbA1c: 6.1 (Normal <5.7%)").
- Use plain numbers without units in the value (e.g. "Haemoglobin: 138" not "Haemoglobin: 138 g/L").
- For qualitative urinalysis results use exactly one word: Negative, Positive, or Trace.
- If you cannot read a value confidently, skip that line rather than guessing.
- If there are multiple pages/images, combine everything into one flat list with no duplicate parameters (if a parameter appears more than once, use the clearest/most recent reading).
- Do not include patient name, age, dates, lab name, or any other non-test-result information.`;

export interface ExtractResult {
  markerText: string;
  filesProcessed: number;
}

export async function extractMarkersFromFiles(fileUrls: string[]): Promise<ExtractResult> {
  const urls = fileUrls.filter(Boolean).slice(0, MAX_FILES);
  if (urls.length === 0) {
    throw new Error("No uploaded files to analyze.");
  }

  const client = getClient();

  const content: Anthropic.Messages.ContentBlockParam[] = [];
  for (const url of urls) {
    const { base64, mediaType } = await fetchAsBase64(url);
    if (mediaType === "application/pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      });
    } else {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
          data: base64,
        },
      });
    }
  }
  content.push({
    type: "text",
    text: "Extract every lab test result from the report page(s)/photo(s) above, following the system instructions exactly.",
  });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const textBlocks = message.content.filter(
    (b): b is Anthropic.Messages.TextBlock => b.type === "text",
  );
  const markerText = textBlocks.map((b) => b.text).join("\n").trim();

  if (!markerText) {
    throw new Error("Could not extract any readable values from the uploaded file(s).");
  }

  return { markerText, filesProcessed: urls.length };
}
