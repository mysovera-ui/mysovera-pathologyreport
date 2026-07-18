// Pay-to-unlock-delivery model: the customer picks a report tier at
// submission time, and the amount charged (once review is complete, before
// they receive the actual PDF) depends on which tier they chose.
export type ReportTier = "basic" | "standard" | "premium";

export const TIER_PRICING_MYR: Record<ReportTier, number> = {
  basic: 29,
  standard: 49,
  premium: 89,
};

export const TIER_LABELS: Record<ReportTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

export const TIER_DESCRIPTIONS: Record<ReportTier, string> = {
  basic: "One panel of your choice, plain-language explanation. Standard turnaround.",
  standard: "All panels covered, full structured report with doctor questions and lifestyle recommendations.",
  premium: "Everything in Standard, plus priority processing and a fast-tracked consultation request.",
};

export function isReportTier(value: string): value is ReportTier {
  return value === "basic" || value === "standard" || value === "premium";
}

export function priceForTier(tier: string): number {
  const t = isReportTier(tier) ? tier : "standard";
  return TIER_PRICING_MYR[t];
}

export function priceCentsForTier(tier: string): number {
  return priceForTier(tier) * 100;
}

// Legacy flat-fee constants, kept for anything not yet migrated to tiers.
export const REPORT_PRICE_MYR = TIER_PRICING_MYR.standard;
export const REPORT_PRICE_CENTS = REPORT_PRICE_MYR * 100;
