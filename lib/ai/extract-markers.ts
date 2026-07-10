import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";
const MAX_FILES = 10;
const MARKERS_HEADER = "===LAB_MARKERS===";
const HISTORY_HEADER = "===CLINICAL_HISTORY===";

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

const SYSTEM_PROMPT = `You are a meticulous medical records transcriber. You will be shown one or more pages/photos of a patient's medical records — this can include pathology/lab report pages, and sometimes other clinical documents such as a hospital discharge summary or an imaging (MRI/X-ray/CT) screenshot, possibly scanned or photographed.

You must output your answer in exactly two sections, in this exact format and order, with nothing before, between, or after them except the section headers themselves:

${MARKERS_HEADER}
(lab marker lines go here, or leave this section empty if there are none)
${HISTORY_HEADER}
(clinical history summary goes here, or the single word "None" if there are no non-lab clinical documents)

=== Section 1: ${MARKERS_HEADER} ===
Find every lab test result on any lab-report pages and output them as plain "Parameter: value" lines, one per line. No headings, no commentary, no markdown, no bullet points.
- Use the exact parameter names from this list whenever the test matches one of them (case does not matter, but use these exact words):
${KNOWN_PARAMETERS}
- If a test isn't in that list, still include it using the name printed on the report, in case it's useful, but prioritize accuracy over completeness.
- Only output the numeric or qualitative RESULT value, not the reference range (e.g. "HbA1c: 6.1" not "HbA1c: 6.1 (Normal <5.7%)").
- Use plain numbers without units in the value (e.g. "Haemoglobin: 138" not "Haemoglobin: 138 g/L") — but see the unit-conversion rule below first.
- Unit conversion — this system always expects Haemoglobin and MCHC in g/L. Many lab reports (especially Malaysian hospital
  printouts) report these in g/dL instead. If the source shows g/dL, multiply the value by 10 before outputting it
  (e.g. a printed "Haemoglobin 14.4 g/dL" must be output as "Haemoglobin: 144", not "Haemoglobin: 14.4" — outputting the
  raw 14.4 would be read as a severely abnormal g/L value and is wrong). Always check the unit column next to the result,
  don't assume.
- For the WBC differential (Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils), reports often print both a
  percentage (%) column and an absolute count column (labelled e.g. "Neutrophil count", usually in x10^9/L or the
  equivalent x10^3/uL — same number, no conversion needed). Always use the absolute COUNT column, never the percentage.
- For qualitative urinalysis results use exactly one word: Negative, Positive, or Trace.
- If you cannot read a value confidently, skip that line rather than guessing.
- If a parameter appears more than once across pages, use the clearest/most recent reading — do not output it twice.
- Be careful not to confuse a parameter with a related ratio or derived value printed nearby (e.g. "HDL Cholesterol" is not the same as "Cholesterol/HDL Ratio" or "Non-HDL Cholesterol" — only use the exact parameter, not a ratio calculated from it).
- Do not include patient name, age, dates, lab name, or any other non-test-result information in this section.
- Non-lab pages (discharge summaries, imaging screenshots) have no lines here — their content goes in section 2 instead.

=== Section 2: ${HISTORY_HEADER} ===
If any of the pages are a hospital discharge summary, clinic letter, or imaging report/screenshot (MRI, X-ray, CT, ultrasound, etc.) rather than a lab results table, summarize the clinically relevant content in a few short plain-language bullet lines (each starting with "- "), covering whichever of these are present:
- Final diagnosis / clinical impression
- Key imaging findings (in plain language, e.g. "MRI showed a bulging disc at C5/C6 and C6/C7 with nerve compression")
- Procedures or treatment given
- Follow-up plan (next clinic visit, referrals, medical leave)
Keep it factual and attributed to the source document (e.g. "Per discharge summary from [hospital]: ..."), not your own medical opinion. Do not invent details that aren't on the page. If there are no such documents among the pages, output exactly "None" for this section.`;

export interface ExtractResult {
  markerText: string;
  clinicalHistory: string | null;
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
    text: "Read the page(s)/photo(s) above and produce the two-section output exactly as instructed.",
  });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const textBlocks = message.content.filter(
    (b): b is Anthropic.Messages.TextBlock => b.type === "text",
  );
  const fullText = textBlocks.map((b) => b.text).join("\n").trim();

  if (!fullText) {
    throw new Error("Could not extract anything from the uploaded file(s).");
  }

  const historyIdx = fullText.indexOf(HISTORY_HEADER);
  const markersIdx = fullText.indexOf(MARKERS_HEADER);

  let markerSection = markersIdx >= 0 ? fullText.slice(markersIdx + MARKERS_HEADER.length) : fullText;
  if (historyIdx >= 0) {
    markerSection = fullText.slice(
      markersIdx >= 0 ? markersIdx + MARKERS_HEADER.length : 0,
      historyIdx,
    );
  }
  const historySection = historyIdx >= 0 ? fullText.slice(historyIdx + HISTORY_HEADER.length) : "";

  const markerText = markerSection.trim();
  const historyTrimmed = historySection.trim();
  const clinicalHistory = historyTrimmed.length === 0 || /^none\.?$/i.test(historyTrimmed) ? null : historyTrimmed;

  if (!markerText && !clinicalHistory) {
    throw new Error("Could not extract any readable values or clinical history from the uploaded file(s).");
  }

  return { markerText, clinicalHistory, filesProcessed: urls.length };
}
