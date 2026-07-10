"use client";

import { useState, useTransition } from "react";
import { sendPaymentLinkAction } from "./payment-actions";
import { REPORT_PRICE_MYR } from "@/lib/billplz/pricing";

export function PaymentLinkButton({
  submissionId,
  customerEmail,
  reportStatus,
  paymentStatus,
  billplzUrl,
}: {
  submissionId: string;
  customerEmail: string;
  reportStatus: string;
  paymentStatus: string;
  billplzUrl?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [link, setLink] = useState<string | null>(billplzUrl ?? null);

  if (paymentStatus === "paid" || paymentStatus === "waived") {
    return null;
  }

  if (reportStatus !== "completed" && reportStatus !== "delivered") {
    return (
      <p className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
        Payment link becomes available once the report is marked Completed.
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-neutral-100 pt-3">
      <button
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await sendPaymentLinkAction(submissionId);
            if (result.error) setError(result.error);
            else setSent(true);
          });
        }}
        className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {isPending ? "Sending…" : `Send RM ${REPORT_PRICE_MYR} payment link to ${customerEmail}`}
      </button>
      {sent && (
        <p className="mt-2 text-xs text-teal-700">
          ✓ Payment link emailed to {customerEmail}.{" "}
          {link && (
            <a href={link} target="_blank" className="underline">
              View bill
            </a>
          )}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {sent && (
        <button
          onClick={() => setSent(false)}
          className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 hover:underline"
        >
          Resend
        </button>
      )}
    </div>
  );
}
