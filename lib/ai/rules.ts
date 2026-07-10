// Rule-based intelligence layer (v1) — see docs/INTELLIGENCE_LAYER.md.
// No AI/LLM calls: deterministic marker interpretation only. Reference
// ranges below are generalized adult ranges modeled on the sample report
// format this app targets (Malaysian CPG-aligned general screening panel).
// This NEVER produces a diagnosis — only educational, plain-language
// context (English + Bahasa Malaysia, matching the sample report's
// bilingual style) and generic lifestyle suggestions for a human coach
// to review, edit, and approve before anything reaches a customer.

export type RiskLevel = "low" | "moderate" | "high" | "none";

export interface Bilingual {
  en: string;
  bm: string;
}

export interface FindingResult {
  parameter: string;
  rawValue: string;
  numericValue?: number;
  refRange?: string;
  flag?: string;
  sentence: string;
  sentenceBM: string;
  status: "normal" | "flagged" | "info" | "unrecognized";
}

export interface PanelResult {
  key: string;
  label: string;
  findings: FindingResult[];
  status: string;
  statusBM: string;
  riskLevel: RiskLevel;
}

export interface KeyProblem {
  title: string;
  justification: string;
  justificationBM: string;
  metricsToMonitor: string;
  riskLevel: RiskLevel;
}

export interface NutritionItem {
  focus: string;
  focusBM: string;
  action: string;
  actionBM: string;
  target: string;
  targetBM: string;
}

export interface SupplementItem {
  name: string;
  benefit: string;
  benefitBM: string;
}

export interface Recommendations {
  medical: Bilingual[];
  nutrition: NutritionItem[];
  supplements: SupplementItem[];
  workout: Bilingual[];
  mindfulness: Bilingual[];
  sleep: Bilingual[];
}

export interface StructuredReport {
  panels: PanelResult[];
  overallRisk: RiskLevel;
  overallRiskReason: string;
  overallRiskReasonBM: string;
  keyProblems: KeyProblem[];
  recommendations: Recommendations;
  markersDetected: string[];
  riskFlags: string[];
  confidence: number;
  urgencyScore: number;
}

type Kind = "numeric" | "qualitative";

interface EvalResult {
  flag?: string;
  sentence: string;
  sentenceBM: string;
  status: "normal" | "flagged";
  risk: RiskLevel;
}

interface ParamRule {
  match: RegExp;
  label: string;
  kind: Kind;
  refRange: string;
  evaluate: (raw: string, numeric: number) => EvalResult;
}

interface PanelDef {
  key: string;
  label: string;
  rules: ParamRule[];
}

const QUAL_ABNORMAL = /^(positive|pos|trace|abnormal|high|present)$/i;

function qualitativeNegativeRule(names: RegExp, label: string, labelBM: string): ParamRule {
  return {
    match: names,
    label,
    kind: "qualitative",
    refRange: "Negative",
    evaluate: (raw) => {
      if (QUAL_ABNORMAL.test(raw.trim())) {
        return {
          flag: `${label} ${raw}`,
          sentence: `Your ${label} result came back "${raw}", which is outside the expected negative result and may need follow-up.`,
          sentenceBM: `Keputusan ${labelBM} anda ialah "${raw}", di luar jangkaan (negatif) dan mungkin perlu susulan.`,
          status: "flagged",
          risk: "moderate",
        };
      }
      return {
        sentence: `Your ${label} result is negative, as expected.`,
        sentenceBM: `Keputusan ${labelBM} anda adalah negatif, seperti dijangka.`,
        status: "normal",
        risk: "low",
      };
    },
  };
}

function rangeRule(
  names: RegExp,
  label: string,
  unit: string,
  low: number | null,
  high: number | null,
  opts?: {
    highRisk?: RiskLevel;
    lowRisk?: RiskLevel;
    highSentence?: string;
    highSentenceBM?: string;
    lowSentence?: string;
    lowSentenceBM?: string;
    normalSentenceBM?: string;
  },
): ParamRule {
  const refRange =
    low !== null && high !== null
      ? `${low}–${high} ${unit}`
      : high !== null
      ? `<${high} ${unit}`
      : low !== null
      ? `>${low} ${unit}`
      : "—";
  return {
    match: names,
    label,
    kind: "numeric",
    refRange,
    evaluate: (_raw, v) => {
      if (high !== null && v > high) {
        return {
          flag: `${label} high`,
          sentence:
            opts?.highSentence ??
            `Your ${label} of ${v} ${unit} is above the typical range (${refRange}).`,
          sentenceBM:
            opts?.highSentenceBM ??
            `${label} anda (${v} ${unit}) melebihi julat biasa (${refRange}).`,
          status: "flagged",
          risk: opts?.highRisk ?? "moderate",
        };
      }
      if (low !== null && v < low) {
        return {
          flag: `${label} low`,
          sentence:
            opts?.lowSentence ??
            `Your ${label} of ${v} ${unit} is below the typical range (${refRange}).`,
          sentenceBM:
            opts?.lowSentenceBM ??
            `${label} anda (${v} ${unit}) di bawah julat biasa (${refRange}).`,
          status: "flagged",
          risk: opts?.lowRisk ?? "moderate",
        };
      }
      return {
        sentence: `Your ${label} of ${v} ${unit} is within the typical range (${refRange}).`,
        sentenceBM:
          opts?.normalSentenceBM ??
          `${label} anda (${v} ${unit}) berada dalam julat biasa (${refRange}).`,
        status: "normal",
        risk: "low",
      };
    },
  };
}

const PANELS: PanelDef[] = [
  {
    key: "hematology",
    label: "Hematology (Blood)",
    rules: [
      rangeRule(/^(haemoglobin|hemoglobin|hb)$/i, "Haemoglobin", "g/L", 120, 150, {
        lowSentence: "Your haemoglobin is below the typical range, which can be a sign of anaemia.",
        lowSentenceBM: "Haemoglobin anda di bawah julat biasa, yang boleh menjadi tanda anemia.",
        lowRisk: "moderate",
      }),
      rangeRule(/^rbc$/i, "RBC (red cell count)", "x10^12/L", 4.0, 5.4),
      rangeRule(/^pcv$/i, "PCV", "L/L", 0.36, 0.46),
      rangeRule(/^mcv$/i, "MCV", "fL", 80, 100),
      rangeRule(/^mch$/i, "MCH", "pg", 27, 32),
      rangeRule(/^mchc$/i, "MCHC", "g/L", 300, 350),
      rangeRule(/^rdw$/i, "RDW", "%", 11.0, 15.0),
      rangeRule(/^wbc$/i, "WBC (white cell count)", "x10^9/L", 4.0, 10.0),
      rangeRule(/^neutrophils?$/i, "Neutrophils", "x10^9/L", 2.0, 7.0),
      rangeRule(/^lymphocytes?$/i, "Lymphocytes", "x10^9/L", 1.0, 4.0),
      rangeRule(/^monocytes?$/i, "Monocytes", "x10^9/L", 0.2, 1.0),
      rangeRule(/^eosinophils?$/i, "Eosinophils", "x10^9/L", 0.02, 0.5),
      rangeRule(/^basophils?$/i, "Basophils", "x10^9/L", 0.0, 0.1),
      rangeRule(/^platelets?$/i, "Platelets", "x10^9/L", 150, 410),
      rangeRule(/^mpv$/i, "MPV", "fL", 9.0, 12.34),
      rangeRule(/^pdw$/i, "PDW", "fL", 9.26, 16.24),
      rangeRule(/^esr$/i, "ESR", "mm/h", null, 21, {
        highRisk: "moderate",
        highSentence:
          "Your ESR is mildly elevated — a general, non-specific marker of inflammation. It often needs correlation with symptoms (fever, joint pain, prolonged cough) rather than acting on its own.",
        highSentenceBM:
          "ESR anda sedikit tinggi — penanda keradangan yang tidak spesifik. Biasanya perlu dikaitkan dengan simptom (demam, sakit sendi, batuk berpanjangan) untuk tafsiran yang tepat.",
      }),
    ],
  },
  {
    key: "diabetes",
    label: "Diabetes Screen (Blood Sugar)",
    rules: [
      rangeRule(/^(glucose|glucose \(fasting\)|fasting glucose)$/i, "Fasting Glucose", "mmol/L", 3.9, 6.0, {
        highRisk: "moderate",
        highSentence:
          "Your fasting glucose is above the typical range, which can indicate prediabetes (6.1–6.9 mmol/L) or diabetes (>= 7.0 mmol/L) depending on how high — best discussed with your doctor.",
        highSentenceBM:
          "Gula puasa anda melebihi julat biasa, yang boleh menunjukkan pra-diabetes (6.1–6.9 mmol/L) atau diabetes (>= 7.0 mmol/L) bergantung tahap — sila rujuk doktor.",
      }),
      {
        match: /^hba1c$/i,
        label: "HbA1c",
        kind: "numeric",
        refRange: "Normal <5.7%; Pre-diabetes 5.7–6.2%; Diabetes >= 6.3%",
        evaluate: (_raw, v) => {
          if (v >= 6.3) {
            return {
              flag: "HbA1c diabetes range",
              sentence: `Your HbA1c of ${v}% is in the diabetes range (>= 6.3%). This is a signal to talk to your doctor soon.`,
              sentenceBM: `HbA1c anda (${v}%) berada dalam julat diabetes (>= 6.3%). Ini adalah tanda untuk berjumpa doktor tidak lama lagi.`,
              status: "flagged",
              risk: "high",
            };
          }
          if (v >= 5.7) {
            return {
              flag: "HbA1c pre-diabetes range",
              sentence: `Your HbA1c of ${v}% places you in the pre-diabetes range (5.7–6.2%). This does not mean you have diabetes, but it's a signal to make lifestyle changes now.`,
              sentenceBM: `HbA1c anda (${v}%) berada dalam julat pra-diabetes (5.7–6.2%). Ini tidak bermaksud anda menghidap diabetes, tetapi ia adalah tanda untuk membuat perubahan gaya hidup sekarang.`,
              status: "flagged",
              risk: "moderate",
            };
          }
          return {
            sentence: `Your HbA1c of ${v}% is within the normal range (<5.7%).`,
            sentenceBM: `HbA1c anda (${v}%) berada dalam julat normal (<5.7%).`,
            status: "normal",
            risk: "low",
          };
        },
      },
    ],
  },
  {
    key: "kidney",
    label: "Kidney Function (Renal Profile)",
    rules: [
      rangeRule(/^sodium$/i, "Sodium", "mmol/L", 135, 145),
      rangeRule(/^potassium$/i, "Potassium", "mmol/L", 3.5, 5.1),
      rangeRule(/^chloride$/i, "Chloride", "mmol/L", 95, 110),
      rangeRule(/^urea$/i, "Urea", "mmol/L", 2.5, 8.0),
      rangeRule(/^creatinine$/i, "Creatinine", "µmol/L", 40, 80, {
        highSentence: "Your creatinine is higher than typical, which can be a sign your kidneys are working harder than usual.",
        highSentenceBM: "Kreatinin anda lebih tinggi daripada biasa, yang boleh menjadi tanda buah pinggang anda bekerja lebih kuat.",
      }),
      {
        match: /^egfr$/i,
        label: "eGFR",
        kind: "numeric",
        refRange: "Normal >90 mL/min/1.73m²",
        evaluate: (_raw, v) => {
          if (v < 60) {
            return {
              flag: "eGFR reduced",
              sentence: `Your eGFR of ${v} is below 60, a level that can indicate reduced kidney function and usually warrants medical follow-up.`,
              sentenceBM: `eGFR anda (${v}) di bawah 60, tahap yang boleh menunjukkan fungsi buah pinggang menurun dan biasanya memerlukan susulan doktor.`,
              status: "flagged",
              risk: "high",
            };
          }
          if (v < 90) {
            return {
              flag: "eGFR mildly reduced",
              sentence: `Your eGFR of ${v} is mildly below the typical >90 range.`,
              sentenceBM: `eGFR anda (${v}) sedikit di bawah julat biasa (>90).`,
              status: "flagged",
              risk: "moderate",
            };
          }
          return {
            sentence: `Your eGFR of ${v} is within the normal range (>90).`,
            sentenceBM: `eGFR anda (${v}) berada dalam julat normal (>90).`,
            status: "normal",
            risk: "low",
          };
        },
      },
      rangeRule(/^uric acid$/i, "Uric Acid", "mmol/L", 0.15, 0.45),
      rangeRule(/^(corrected )?calcium$/i, "Calcium", "mmol/L", 2.1, 2.55),
      rangeRule(/^phosphate$/i, "Phosphate", "mmol/L", 0.65, 1.45),
    ],
  },
  {
    key: "liver",
    label: "Liver Function & Basic Biochemistry",
    rules: [
      rangeRule(/^magnesium$/i, "Magnesium", "mmol/L", 0.66, 1.07),
      rangeRule(/^total protein$/i, "Total Protein", "g/L", 60, 82),
      rangeRule(/^albumin$/i, "Albumin", "g/L", 35, 50),
      rangeRule(/^globulin$/i, "Globulin", "g/L", 20, 39),
      rangeRule(/^(a\/g ratio|ag ratio)$/i, "A/G Ratio", "", 1.0, 2.5),
      rangeRule(/^alp$/i, "ALP", "U/L", 30, 150),
      rangeRule(/^total bilirubin$/i, "Total Bilirubin", "µmol/L", null, 21.0),
      rangeRule(/^ggt$/i, "GGT", "U/L", null, 51),
      rangeRule(/^ast$/i, "AST", "U/L", null, 41, {
        highSentence: "Your AST is higher than typical, which can indicate the liver is under some stress.",
        highSentenceBM: "AST anda lebih tinggi daripada biasa, yang boleh menunjukkan hati sedang tertekan.",
      }),
      rangeRule(/^alt$/i, "ALT", "U/L", null, 51, {
        highSentence: "Your ALT is higher than typical, which can indicate the liver is under some stress.",
        highSentenceBM: "ALT anda lebih tinggi daripada biasa, yang boleh menunjukkan hati sedang tertekan.",
      }),
    ],
  },
  {
    key: "lipid",
    label: "Lipid Profile (Blood Fats)",
    rules: [
      rangeRule(/^(total cholesterol|cholesterol|total chol)$/i, "Total Cholesterol", "mmol/L", null, 5.2, {
        highRisk: "high",
        highSentenceBM: "Jumlah kolesterol anda melebihi julat biasa (<5.2 mmol/L).",
      }),
      rangeRule(/^(triglycerides?|trig)$/i, "Triglycerides", "mmol/L", null, 1.7),
      rangeRule(/^hdl(-c)?$/i, "HDL (good cholesterol)", "mmol/L", 1.2, null, {
        lowRisk: "moderate",
        lowSentence: "Your HDL (good cholesterol) is lower than recommended.",
        lowSentenceBM: "HDL (kolesterol baik) anda lebih rendah daripada disyorkan.",
      }),
      rangeRule(/^ldl(-c)?$/i, "LDL (bad cholesterol)", "mmol/L", null, 2.6, {
        highRisk: "high",
        highSentence:
          "Your LDL (bad cholesterol) is above the recommended level. This means fatty deposits may build up in your arteries over time — LDL is the main target for heart disease/stroke prevention.",
        highSentenceBM:
          "LDL (kolesterol jahat) anda melebihi tahap yang disyorkan. Ini bermakna lemak boleh terkumpul dalam salur darah dari semasa ke semasa — LDL ialah sasaran utama pencegahan penyakit jantung/strok.",
      }),
      rangeRule(/^non-?hdl$/i, "Non-HDL Cholesterol", "mmol/L", null, 3.4, {
        highRisk: "high",
        highSentenceBM: "Non-HDL kolesterol anda melebihi julat biasa (<3.4 mmol/L).",
      }),
    ],
  },
  {
    key: "urinalysis",
    label: "Urinalysis (FEME Urine)",
    rules: [
      qualitativeNegativeRule(/^leukocytes?$/i, "Leukocytes", "Leukosit"),
      qualitativeNegativeRule(/^blood$/i, "Blood", "Darah"),
      qualitativeNegativeRule(/^nitrite$/i, "Nitrite", "Nitrit"),
      qualitativeNegativeRule(/^ketones?$/i, "Ketones", "Keton"),
      qualitativeNegativeRule(/^(protein)$/i, "Protein (urine)", "Protein (air kencing)"),
      rangeRule(/^(specific gravity)$/i, "Specific Gravity", "", 1.003, 1.035),
      rangeRule(/^ph$/i, "Urine pH", "", 5.0, 9.0),
    ],
  },
  {
    key: "thyroid",
    label: "Thyroid Screen",
    rules: [
      rangeRule(/^(ft4|free t4)$/i, "Free T4 (FT4)", "pmol/L", 9.0, 25.0),
      rangeRule(/^(ft3|free t3)$/i, "Free T3 (FT3)", "pmol/L", 3.5, 6.5),
      rangeRule(/^tsh$/i, "TSH", "mIU/L", 0.4, 4.7, {
        highRisk: "moderate",
        highSentence:
          "Your TSH is above the typical range. Combined with a normal FT4, this pattern can support subclinical hypothyroidism (an early/mild underactive thyroid), which can also affect cholesterol levels — usually worth a doctor's follow-up (repeat TSH/FT4, thyroid antibodies if needed).",
        highSentenceBM:
          "TSH anda melebihi julat biasa. Digabungkan dengan FT4 yang normal, corak ini boleh menyokong hipotiroid subklinikal (tiroid kurang aktif peringkat awal/ringan), yang juga boleh mempengaruhi paras kolesterol — biasanya perlu susulan doktor (ulang TSH/FT4, antibodi tiroid jika perlu).",
      }),
    ],
  },
  {
    key: "tumor_markers",
    label: "Tumor Markers",
    rules: [
      rangeRule(/^(afp|alpha-?feto protein)$/i, "AFP", "µg/L", null, 11),
      rangeRule(/^cea$/i, "CEA", "µg/L", null, 5.1),
      rangeRule(/^ca ?125$/i, "CA 125", "U/mL", null, 36),
      rangeRule(/^ca ?19-?9$/i, "CA 19-9", "U/mL", null, 32),
      rangeRule(/^ca ?15-?3$/i, "CA 15-3", "U/mL", null, 39.1),
    ],
  },
  {
    key: "h_pylori",
    label: "H. pylori Serology",
    rules: [rangeRule(/^(h\.? ?pylori( igg)?( ab)?|hpylori)$/i, "H. pylori IgG", "index", null, 0.8)],
  },
  {
    key: "vitamin_d",
    label: "Vitamin D",
    rules: [
      {
        match: /^(vitamin d|25-?oh vitamin d|25 hydroxy vitamin d)$/i,
        label: "25-hydroxy Vitamin D",
        kind: "numeric",
        refRange: "Deficiency <= 50; Insufficiency 51–74; Sufficiency 75–350 nmol/L",
        evaluate: (_raw, v) => {
          if (v <= 50) {
            return {
              flag: "Vitamin D deficiency",
              sentence: `Your Vitamin D of ${v} nmol/L is in the deficiency range (<= 50), which can affect bone/muscle health and general wellbeing.`,
              sentenceBM: `Vitamin D anda (${v} nmol/L) berada dalam julat kekurangan (<= 50), yang boleh menjejaskan kesihatan tulang/otot dan kesejahteraan umum.`,
              status: "flagged",
              risk: "moderate",
            };
          }
          if (v < 75) {
            return {
              flag: "Vitamin D insufficient",
              sentence: `Your Vitamin D of ${v} nmol/L is insufficient (51–74), below the sufficient range.`,
              sentenceBM: `Vitamin D anda (${v} nmol/L) tidak mencukupi (51–74), di bawah julat mencukupi.`,
              status: "flagged",
              risk: "moderate",
            };
          }
          return {
            sentence: `Your Vitamin D of ${v} nmol/L is in the sufficient range (75–350).`,
            sentenceBM: `Vitamin D anda (${v} nmol/L) berada dalam julat mencukupi (75–350).`,
            status: "normal",
            risk: "low",
          };
        },
      },
    ],
  },
  {
    key: "vitamin_b12",
    label: "Vitamin B12",
    rules: [rangeRule(/^(vitamin b12|b12)$/i, "Vitamin B12", "pmol/L", 141, 569)],
  },
  {
    key: "iron_studies",
    label: "Iron Studies",
    rules: [
      rangeRule(/^(serum iron|iron)$/i, "Serum Iron", "µmol/L", 9.0, 26.0),
      rangeRule(/^transferrin$/i, "Transferrin", "g/L", 1.8, 2.7),
      rangeRule(/^tibc$/i, "TIBC", "µmol/L", 45.0, 70.0),
      rangeRule(/^saturation$/i, "Saturation", "%", 13, 51),
      rangeRule(/^ferritin$/i, "Ferritin", "µg/L", 13, 51, { highRisk: "low", lowRisk: "moderate" }),
    ],
  },
  {
    key: "hormone",
    label: "Hormone / Menopause Screen",
    rules: [
      {
        match: /^fsh$/i,
        label: "FSH",
        kind: "numeric",
        refRange: "Depends on menstrual cycle phase",
        evaluate: (_raw, v) => ({
          sentence: `FSH recorded at ${v} IU/L. Interpretation depends on menstrual cycle phase and menopause status — clinical correlation needed.`,
          sentenceBM: `FSH direkodkan pada ${v} IU/L. Tafsiran bergantung kepada fasa kitaran haid dan status menopaus — perlu korelasi klinikal.`,
          status: "normal",
          risk: "none",
        }),
      },
      {
        match: /^lh$/i,
        label: "LH",
        kind: "numeric",
        refRange: "Depends on menstrual cycle phase",
        evaluate: (_raw, v) => ({
          sentence: `LH recorded at ${v} IU/L. Interpretation depends on menstrual cycle phase — clinical correlation needed.`,
          sentenceBM: `LH direkodkan pada ${v} IU/L. Tafsiran bergantung kepada fasa kitaran haid — perlu korelasi klinikal.`,
          status: "normal",
          risk: "none",
        }),
      },
      {
        match: /^(estradiol|e2)$/i,
        label: "Estradiol (E2)",
        kind: "numeric",
        refRange: "Depends on menstrual cycle phase",
        evaluate: (_raw, v) => ({
          sentence: `Estradiol recorded at ${v} pmol/L. Interpretation depends on cycle day and symptoms (hot flushes, irregular periods, etc.) — clinical correlation needed.`,
          sentenceBM: `Estradiol direkodkan pada ${v} pmol/L. Tafsiran bergantung kepada hari kitaran dan simptom (panas badan, haid tidak teratur, dll) — perlu korelasi klinikal.`,
          status: "normal",
          risk: "none",
        }),
      },
    ],
  },
];

export const PANEL_OPTIONS: { value: string; label: string }[] = [
  ...PANELS.map((p) => ({ value: p.key, label: p.label })),
  { value: "ecg", label: "ECG / Stress Test" },
  { value: "other", label: "Other / Not Sure" },
];

export function parseMarkers(input: string): { key: string; raw: string }[] {
  const results: { key: string; raw: string }[] = [];
  const pairs = input.split(/[,\n]/);
  for (const pair of pairs) {
    const m = pair.match(/([A-Za-z][A-Za-z0-9 ./]*?)\s*[:=]\s*([A-Za-z0-9.+-]+)/);
    if (m) {
      results.push({ key: m[1].trim(), raw: m[2].trim() });
    }
  }
  return results;
}

function riskRank(r: RiskLevel): number {
  return r === "high" ? 3 : r === "moderate" ? 2 : r === "low" ? 1 : 0;
}

const RECOMMENDATION_LIBRARY: Record<
  string,
  { medical?: Bilingual; nutrition?: NutritionItem; supplement?: SupplementItem }
> = {
  lipid: {
    medical: {
      en: "Discuss overall cardiovascular risk with your doctor, including whether cholesterol-lowering treatment is appropriate given your medical history, blood pressure, and other risk factors.",
      bm: "Bincangkan risiko kardiovaskular keseluruhan dengan doktor anda, termasuk sama ada rawatan penurun kolesterol sesuai berdasarkan sejarah perubatan, tekanan darah, dan faktor risiko lain.",
    },
    nutrition: {
      focus: "High LDL / Total Cholesterol",
      focusBM: "LDL / Jumlah Kolesterol Tinggi",
      action:
        "Reduce saturated and trans fats; increase soluble fibre (vegetables, oats, legumes); choose lean protein sources.",
      actionBM:
        "Kurangkan lemak tepu & trans; tambah serat larut (sayur, oat, kekacang); pilih sumber protein tanpa lemak.",
      target: "Lower LDL and Non-HDL cholesterol",
      targetBM: "Turunkan LDL dan Non-HDL kolesterol",
    },
    supplement: {
      name: "Omega-3 (if suitable)",
      benefit: "May support heart health and lipid profile, particularly if triglycerides are elevated.",
      benefitBM: "Boleh menyokong kesihatan jantung dan profil lipid, terutamanya jika trigliserida tinggi.",
    },
  },
  diabetes: {
    medical: {
      en: "Discuss your blood sugar trend with your doctor — periodic HbA1c monitoring and lifestyle changes are typically advised for pre-diabetes.",
      bm: "Bincangkan trend gula darah anda dengan doktor — pemantauan HbA1c berkala dan perubahan gaya hidup biasanya disyorkan untuk pra-diabetes.",
    },
    nutrition: {
      focus: "Pre-diabetes / elevated blood sugar",
      focusBM: "Pra-diabetes / gula darah tinggi",
      action: "Limit refined carbohydrates and sugary foods; choose higher-fibre carbohydrate sources; moderate portion sizes.",
      actionBM: "Kurangkan karbohidrat ringkas & makanan manis; pilih karbohidrat berserat; kawal saiz hidangan.",
      target: "Stabilize HbA1c",
      targetBM: "Stabilkan HbA1c",
    },
  },
  thyroid: {
    medical: {
      en: "Discuss your TSH result with your doctor — they may recommend repeat testing or thyroid antibody tests to clarify subclinical thyroid changes.",
      bm: "Bincangkan keputusan TSH anda dengan doktor — mereka mungkin mencadangkan ujian ulangan atau ujian antibodi tiroid untuk mengesahkan perubahan tiroid subklinikal.",
    },
  },
  vitamin_d: {
    nutrition: {
      focus: "Vitamin D insufficiency",
      focusBM: "Vitamin D tidak mencukupi",
      action: "Increase appropriate dietary sources and safe sun exposure.",
      actionBM: "Tingkatkan sumber makanan sesuai dan pendedahan cahaya matahari secara selamat.",
      target: "Reach sufficient Vitamin D levels",
      targetBM: "Capai tahap Vitamin D yang mencukupi",
    },
    supplement: {
      name: "Vitamin D",
      benefit: "Supports bone, muscle, and immune health.",
      benefitBM: "Menyokong kesihatan tulang, otot, dan imun.",
    },
  },
  hematology: {
    nutrition: {
      focus: "Mild inflammation marker (ESR)",
      focusBM: "Penanda keradangan ringan (ESR)",
      action: "Maintain a balanced diet, stay well hydrated, and monitor symptoms.",
      actionBM: "Kekalkan pemakanan seimbang, cukup hidrasi, dan pantau simptom.",
      target: "Normalize inflammation markers",
      targetBM: "Normalisasi penanda keradangan",
    },
  },
  kidney: {
    medical: {
      en: "Discuss your kidney function results with your doctor, especially if this is a new or persistent finding.",
      bm: "Bincangkan keputusan fungsi buah pinggang anda dengan doktor, terutamanya jika ini penemuan baharu atau berterusan.",
    },
  },
  iron_studies: {
    medical: {
      en: "Discuss your iron study results with your doctor if you have symptoms of fatigue or anaemia.",
      bm: "Bincangkan keputusan kajian zat besi anda dengan doktor jika anda mempunyai simptom keletihan atau anemia.",
    },
  },
};

export function generateStructuredReport(
  markerInput: string,
  opts?: { customerName?: string },
): StructuredReport {
  const parsed = parseMarkers(markerInput);
  const panels: PanelResult[] = [];
  const riskFlags: string[] = [];
  const markersDetected: string[] = [];
  let outOfRangeCount = 0;
  let recognizedCount = 0;

  for (const panelDef of PANELS) {
    const findings: FindingResult[] = [];
    for (const { key, raw } of parsed) {
      const rule = panelDef.rules.find((r) => r.match.test(key));
      if (!rule) continue;

      recognizedCount++;
      markersDetected.push(rule.label);
      const numeric = parseFloat(raw);
      if (rule.kind === "numeric" && isNaN(numeric)) {
        findings.push({
          parameter: rule.label,
          rawValue: raw,
          refRange: rule.refRange,
          sentence: `${rule.label}: "${raw}" could not be read as a number — please re-check this value.`,
          sentenceBM: `${rule.label}: "${raw}" tidak dapat dibaca sebagai nombor — sila semak semula nilai ini.`,
          status: "unrecognized",
        });
        continue;
      }
      const evaluated = rule.evaluate(raw, numeric);
      if (evaluated.status === "flagged") {
        outOfRangeCount++;
        if (evaluated.flag) riskFlags.push(evaluated.flag);
      }
      findings.push({
        parameter: rule.label,
        rawValue: raw,
        numericValue: rule.kind === "numeric" ? numeric : undefined,
        refRange: rule.refRange,
        flag: evaluated.flag,
        sentence: evaluated.sentence,
        sentenceBM: evaluated.sentenceBM,
        status: evaluated.status,
      });
    }

    if (findings.length === 0) continue;

    const flaggedFindings = findings.filter((f) => f.status === "flagged");
    const panelRisk: RiskLevel =
      flaggedFindings.length === 0
        ? "low"
        : panelDef.key === "lipid" || panelDef.key === "diabetes"
        ? "high"
        : "moderate";

    const flaggedNames = flaggedFindings.map((f) => f.parameter).join(", ");
    panels.push({
      key: panelDef.key,
      label: panelDef.label,
      findings,
      status: flaggedFindings.length === 0 ? "Generally normal" : `Generally normal, ${flaggedNames} flagged`,
      statusBM: flaggedFindings.length === 0 ? "Umumnya normal" : `Umumnya normal, ${flaggedNames} ditandakan`,
      riskLevel: panelRisk,
    });
  }

  const overallRisk: RiskLevel =
    panels.length === 0
      ? "none"
      : panels.some((p) => p.riskLevel === "high")
      ? "high"
      : panels.some((p) => p.riskLevel === "moderate")
      ? "moderate"
      : "low";

  const flaggedPanels = panels
    .filter((p) => p.riskLevel !== "low" && p.riskLevel !== "none")
    .sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel));

  const keyProblems: KeyProblem[] = flaggedPanels.slice(0, 6).map((p) => {
    const flaggedFindings = p.findings.filter((f) => f.status === "flagged");
    const flaggedNames = flaggedFindings.map((f) => f.parameter);
    return {
      title: `${flaggedNames.join(", ")} (${p.label})`,
      justification: flaggedFindings[0]?.sentence ?? "",
      justificationBM: flaggedFindings[0]?.sentenceBM ?? "",
      metricsToMonitor: flaggedNames.join(", "),
      riskLevel: p.riskLevel,
    };
  });

  const recommendations: Recommendations = { medical: [], nutrition: [], supplements: [], workout: [], mindfulness: [], sleep: [] };

  for (const p of flaggedPanels) {
    const lib = RECOMMENDATION_LIBRARY[p.key];
    if (!lib) continue;
    if (lib.medical) recommendations.medical.push(lib.medical);
    if (lib.nutrition) recommendations.nutrition.push(lib.nutrition);
    if (lib.supplement) recommendations.supplements.push(lib.supplement);
  }

  if (flaggedPanels.length > 0) {
    recommendations.workout.push({
      en: "Regular physical activity suited to age and fitness level (e.g. a mix of light-to-moderate cardio and basic strength training) — discuss with your doctor before starting a new routine if you have existing conditions.",
      bm: "Aktiviti fizikal berkala mengikut kemampuan umur & kesihatan (contoh: gabungan kardio ringan-sederhana + latihan kekuatan asas) — berbincang dengan doktor sebelum memulakan rutin baharu jika ada keadaan sedia ada.",
    });
    recommendations.mindfulness.push({
      en: "Build in 5–10 minutes of daily mindfulness practice — slow breathing, guided meditation, or a short gratitude journal — to help lower the stress hormones that can affect blood sugar, blood pressure, and sleep quality.",
      bm: "Amalkan 5–10 minit kesedaran minda (mindfulness) setiap hari — pernafasan perlahan, meditasi berpandu, atau jurnal kesyukuran ringkas — untuk membantu menurunkan hormon tekanan yang boleh menjejaskan gula darah, tekanan darah, dan kualiti tidur.",
    });
    recommendations.mindfulness.push({
      en: "Practise mindful eating (slow down, no screens during meals) and take short digital-detox breaks during the day to reduce accumulated stress.",
      bm: "Amalkan pemakanan penuh kesedaran (makan perlahan, elakkan skrin semasa makan) dan ambil rehat detoks digital ringkas sepanjang hari untuk mengurangkan tekanan terkumpul.",
    });
    recommendations.sleep.push({
      en: "Keep a consistent sleep schedule, avoid caffeine late in the day, and build in simple relaxation habits (slow breathing, light stretching).",
      bm: "Tidur konsisten setiap hari, elakkan kafein lewat petang/malam, dan amalkan aktiviti ringkas untuk relaks (pernafasan perlahan, regangan ringan).",
    });
  }

  const confidence = recognizedCount > 0 ? Math.min(0.95, 0.55 + recognizedCount * 0.03) : 0;
  const urgencyScore = Math.min(10, outOfRangeCount * 2);

  return {
    panels,
    overallRisk,
    overallRiskReason:
      flaggedPanels.length > 0
        ? `Main driver(s): ${flaggedPanels.map((p) => p.label).join("; ")}.`
        : "All entered markers are within typical ranges.",
    overallRiskReasonBM:
      flaggedPanels.length > 0
        ? `Punca utama: ${flaggedPanels.map((p) => p.label).join("; ")}.`
        : "Semua penanda yang dimasukkan berada dalam julat biasa.",
    keyProblems,
    recommendations,
    markersDetected,
    riskFlags,
    confidence,
    urgencyScore,
  };
}

export function renderReportText(report: StructuredReport, customerName?: string): string {
  const lines: string[] = [];
  lines.push(`CLINICAL HEALTH REPORT SUMMARY — ${customerName ?? ""}`.trim());
  lines.push("");
  lines.push(`Overall Status: ${report.overallRisk.toUpperCase()}`);
  lines.push(report.overallRiskReason);
  lines.push("");
  lines.push("=== OVERVIEW BY AREA ===");
  if (report.panels.length === 0) {
    lines.push("No marker values were provided, so no interpretation could be generated.");
  }
  for (const p of report.panels) {
    lines.push(`- ${p.label}: ${p.status} [${p.riskLevel.toUpperCase()} risk]`);
  }
  lines.push("");
  lines.push("=== DETAILED FINDINGS (by panel) ===");
  for (const p of report.panels) {
    lines.push(`${p.label}:`);
    for (const f of p.findings) {
      lines.push(`  • ${f.sentence}`);
    }
    lines.push("");
  }
  if (report.keyProblems.length > 0) {
    lines.push("=== SUMMARY OF KEY PROBLEMS ===");
    report.keyProblems.forEach((kp, i) => {
      lines.push(`${i + 1}. ${kp.title} [${kp.riskLevel}]`);
      lines.push(`   ${kp.justification}`);
      lines.push(`   Metrics to monitor: ${kp.metricsToMonitor}`);
    });
    lines.push("");
  }
  const rec = report.recommendations;
  if (rec.medical.length || rec.nutrition.length || rec.supplements.length) {
    lines.push("=== RECOMMENDATIONS (AI-suggested — coach must review before sending) ===");
    if (rec.medical.length) {
      lines.push("Medical:");
      rec.medical.forEach((m) => lines.push(`  • ${m.en}`));
    }
    if (rec.nutrition.length) {
      lines.push("Nutrition (3-month focus):");
      rec.nutrition.forEach((n) => lines.push(`  • ${n.focus} — ${n.action} (target: ${n.target})`));
    }
    if (rec.supplements.length) {
      lines.push("Supplements (discuss with doctor first):");
      rec.supplements.forEach((s) => lines.push(`  • ${s.name}: ${s.benefit}`));
    }
    if (rec.workout.length) {
      lines.push("Activity:");
      rec.workout.forEach((w) => lines.push(`  • ${w.en}`));
    }
    if (rec.mindfulness.length) {
      lines.push("Mindfulness:");
      rec.mindfulness.forEach((m) => lines.push(`  • ${m.en}`));
    }
    if (rec.sleep.length) {
      lines.push("Sleep & Stress:");
      rec.sleep.forEach((s) => lines.push(`  • ${s.en}`));
    }
    lines.push("");
  }
  lines.push(
    "This is an educational summary based on the values provided, not a diagnosis. Please discuss these results with your doctor, especially before starting any supplement or treatment.",
  );

  return lines.join("\n");
}
