// Rule-based intelligence layer (v1) — see docs/INTELLIGENCE_LAYER.md.
// No AI/LLM calls: deterministic marker interpretation only. Never produces a
// diagnosis — only educational, plain-language context for the team to
// review and edit before it reaches a customer.

interface MarkerRule {
  match: RegExp;
  evaluate: (value: number) => {
    flag?: string;
    sentence: string;
    outOfRange: boolean;
  };
}

const RULES: MarkerRule[] = [
  {
    match: /^ldl$/i,
    evaluate: (v) => {
      if (v > 5.0)
        return {
          flag: "LDL elevated",
          outOfRange: true,
          sentence: `Your LDL (bad cholesterol) of ${v} is above the recommended range. This means fatty deposits may build up in your arteries over time.`,
        };
      if (v > 3.0)
        return {
          flag: "LDL borderline",
          outOfRange: true,
          sentence: `Your LDL (bad cholesterol) of ${v} is borderline-high — worth keeping an eye on.`,
        };
      return { outOfRange: false, sentence: `Your LDL (bad cholesterol) of ${v} is within a healthy range.` };
    },
  },
  {
    match: /^hdl$/i,
    evaluate: (v) => {
      if (v < 1.0)
        return {
          flag: "HDL low",
          outOfRange: true,
          sentence: `Your HDL (good cholesterol) of ${v} is lower than recommended.`,
        };
      return { outOfRange: false, sentence: `Your HDL (good cholesterol) of ${v} is within a healthy range, which is positive.` };
    },
  },
  {
    match: /^(triglycerides|trig)$/i,
    evaluate: (v) => {
      if (v > 2.3)
        return {
          flag: "Triglycerides elevated",
          outOfRange: true,
          sentence: `Your triglycerides of ${v} are above the recommended level.`,
        };
      return { outOfRange: false, sentence: `Your triglycerides of ${v} are within a healthy range.` };
    },
  },
  {
    match: /^(total cholesterol|cholesterol)$/i,
    evaluate: (v) => {
      if (v > 6.2)
        return {
          flag: "Total cholesterol elevated",
          outOfRange: true,
          sentence: `Your total cholesterol of ${v} is above the recommended level.`,
        };
      return { outOfRange: false, sentence: `Your total cholesterol of ${v} is within a healthy range.` };
    },
  },
  {
    match: /^hba1c$/i,
    evaluate: (v) => {
      if (v > 6.5)
        return {
          flag: "HbA1c diabetes range",
          outOfRange: true,
          sentence: `Your HbA1c of ${v}% is in the diabetes range (above 6.5%). This is a signal to talk to your doctor soon.`,
        };
      if (v >= 5.7)
        return {
          flag: "HbA1c pre-diabetes range",
          outOfRange: true,
          sentence: `Your HbA1c of ${v}% places you in the pre-diabetes range (5.7–6.4%). This does not mean you have diabetes, but it is a signal to make lifestyle changes now.`,
        };
      return { outOfRange: false, sentence: `Your HbA1c of ${v}% is within the normal range.` };
    },
  },
  {
    match: /^(alt|ast)$/i,
    evaluate: (v) => {
      if (v > 40)
        return {
          flag: "Liver enzymes elevated",
          outOfRange: true,
          sentence: `Your liver enzyme level of ${v} U/L is higher than the typical range, which can indicate the liver is under some stress.`,
        };
      return { outOfRange: false, sentence: `Your liver enzyme level of ${v} U/L is within the typical range.` };
    },
  },
  {
    match: /^creatinine$/i,
    evaluate: (v) => {
      if (v > 1.2)
        return {
          flag: "Creatinine flagged HIGH",
          outOfRange: true,
          sentence: `Your creatinine of ${v} mg/dL is higher than typical, which can be a sign your kidneys are working harder than usual.`,
        };
      return { outOfRange: false, sentence: `Your creatinine of ${v} mg/dL is within the typical range.` };
    },
  },
  {
    match: /^egfr$/i,
    evaluate: (v) => {
      if (v < 60)
        return {
          flag: "eGFR reduced",
          outOfRange: true,
          sentence: `Your eGFR of ${v} is lower than typical, a measure of how well your kidneys filter waste.`,
        };
      return { outOfRange: false, sentence: `Your eGFR of ${v} is within the typical range.` };
    },
  },
  {
    match: /^tsh$/i,
    evaluate: (v) => {
      if (v < 0.4 || v > 4.0)
        return {
          flag: "TSH outside 0.4–4.0",
          outOfRange: true,
          sentence: `Your TSH of ${v} is outside the typical 0.4–4.0 range, which can point to an over- or under-active thyroid.`,
        };
      return { outOfRange: false, sentence: `Your TSH of ${v} is within the typical range.` };
    },
  },
  {
    match: /^(haemoglobin|hemoglobin|hb)$/i,
    evaluate: (v) => {
      if (v < 12)
        return {
          flag: "Haemoglobin low",
          outOfRange: true,
          sentence: `Your haemoglobin of ${v} g/dL is lower than typical, which can be a sign of anaemia.`,
        };
      return { outOfRange: false, sentence: `Your haemoglobin of ${v} g/dL is within the typical range.` };
    },
  },
  {
    match: /^wbc$/i,
    evaluate: (v) => {
      if (v < 4 || v > 11)
        return {
          flag: "White cell count out of range",
          outOfRange: true,
          sentence: `Your white blood cell count of ${v} is outside the typical 4–11 range.`,
        };
      return { outOfRange: false, sentence: `Your white blood cell count of ${v} is within the typical range.` };
    },
  },
];

export interface MarkerResult {
  key: string;
  value: number;
  sentence: string;
  flag?: string;
  outOfRange: boolean;
}

export interface DraftResult {
  draft: string;
  markersDetected: string[];
  riskFlags: string[];
  confidence: number;
  urgencyScore: number;
}

export function parseMarkers(input: string): { key: string; value: number }[] {
  const results: { key: string; value: number }[] = [];
  const pairs = input.split(/[,\n]/);
  for (const pair of pairs) {
    const m = pair.match(/([A-Za-z][A-Za-z0-9 ]*?)\s*[:=]\s*(-?\d+(\.\d+)?)/);
    if (m) {
      results.push({ key: m[1].trim(), value: parseFloat(m[2]) });
    }
  }
  return results;
}

export function generateDraft(markerInput: string): DraftResult {
  const parsed = parseMarkers(markerInput);
  const results: MarkerResult[] = [];

  for (const { key, value } of parsed) {
    const rule = RULES.find((r) => r.match.test(key));
    if (rule) {
      const evaluated = rule.evaluate(value);
      results.push({ key, value, ...evaluated });
    } else {
      results.push({
        key,
        value,
        sentence: `${key}: ${value} (recorded, no automated interpretation available for this marker).`,
        outOfRange: false,
      });
    }
  }

  const outOfRangeCount = results.filter((r) => r.outOfRange).length;
  const riskFlags = results.filter((r) => r.flag).map((r) => r.flag!);
  const markersDetected = results.map((r) => r.key);

  const draft =
    results.length > 0
      ? results.map((r) => r.sentence).join(" ") +
        " This is an educational summary, not a diagnosis — please discuss these results with your doctor."
      : "No marker values were provided, so no interpretation could be generated. Please enter at least one marker value.";

  const confidence =
    results.length > 0 ? Math.min(0.95, 0.6 + results.length * 0.07) : 0;

  const urgencyScore = Math.min(10, outOfRangeCount * 3);

  return { draft, markersDetected, riskFlags, confidence, urgencyScore };
}
