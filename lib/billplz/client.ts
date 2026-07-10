import crypto from "crypto";

// Server-side only. Never import this from a client component -- the API
// secret key must never reach the browser.

function getConfig() {
  const apiKey = process.env.BILLPLZ_API_KEY;
  const collectionId = process.env.BILLPLZ_COLLECTION_ID;
  const xSignatureKey = process.env.BILLPLZ_X_SIGNATURE_KEY;
  const sandbox = process.env.BILLPLZ_SANDBOX !== "false"; // default to sandbox unless explicitly disabled

  if (!apiKey || !collectionId || !xSignatureKey) {
    throw new Error("BILLPLZ_NOT_CONFIGURED");
  }

  return {
    apiKey,
    collectionId,
    xSignatureKey,
    baseUrl: sandbox ? "https://www.billplz-sandbox.com" : "https://www.billplz.com",
  };
}

export interface CreateBillResult {
  billId: string;
  url: string;
}

export async function createBill(opts: {
  name: string;
  email: string;
  amountCents: number;
  description: string;
  referenceCode: string;
  callbackUrl: string;
  redirectUrl: string;
}): Promise<CreateBillResult> {
  const { apiKey, collectionId, baseUrl } = getConfig();

  const body = new URLSearchParams({
    collection_id: collectionId,
    email: opts.email,
    name: opts.name,
    amount: String(opts.amountCents),
    description: opts.description,
    callback_url: opts.callbackUrl,
    redirect_url: opts.redirectUrl,
    reference_1_label: "Reference",
    reference_1: opts.referenceCode,
  });

  const res = await fetch(`${baseUrl}/api/v3/bills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${apiKey}:`).toString("base64"),
    },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.error?.message?.join?.(", ") || data?.error?.message || `Billplz API error (HTTP ${res.status})`;
    throw new Error(message);
  }

  return { billId: data.id, url: data.url };
}

// Verifies the X Signature on a Billplz callback payload. Algorithm per
// Billplz's official API reference (X Signature Callback URL):
//   1. Take every field except x_signature.
//   2. Concatenate each as "key" + "value" (empty string for null/undefined).
//   3. Sort those combined strings ascending, case-insensitive.
//   4. Join with "|".
//   5. HMAC-SHA256 the result with the X Signature key; compare hex digest.
export function verifyXSignature(
  params: Record<string, string | undefined>,
  xSignatureKey: string,
): boolean {
  const provided = params.x_signature;
  if (!provided) return false;

  const combined = Object.entries(params)
    .filter(([key]) => key !== "x_signature")
    .map(([key, value]) => `${key}${value ?? ""}`);

  combined.sort((a, b) => {
    const la = a.toLowerCase();
    const lb = b.toLowerCase();
    return la < lb ? -1 : la > lb ? 1 : 0;
  });

  const sourceString = combined.join("|");
  const computed = crypto.createHmac("sha256", xSignatureKey).update(sourceString).digest("hex");

  // Constant-time comparison to avoid timing attacks.
  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function getBillplzXSignatureKey(): string {
  return getConfig().xSignatureKey;
}
