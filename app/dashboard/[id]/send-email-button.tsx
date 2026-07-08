"use client";

import { useState, useTransition } from "react";
import { sendDeliveryEmailAction } from "./email-actions";

export function SendEmailButton({
  submissionId,
  customerEmail,
  emailSentAt,
  emailSentTo,
  emailSendError,
}: {
  submissionId: string;
  customerEmail: string;
  emailSentAt?: string | null;
  emailSentTo?: string | null;
  emailSendError?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(emailSendError ?? null);
  const [sentAt, setSentAt] = useState<string | null>(emailSentAt ?? null);

  return (
    <div className="mt-3 border-t border-neutral-100 pt-3">
      {sentAt ? (
        <p className="text-xs text-teal-700">
          ✓ Emailed to {emailSentTo ?? customerEmail} on{" "}
          {new Date(sentAt).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      ) : (
        <button
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await sendDeliveryEmailAction(submissionId);
              if (result.error) setError(result.error);
              else setSentAt(new Date().toISOString());
            });
          }}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {isPending ? "Sending…" : `Send email to ${customerEmail}`}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {sentAt && (
        <button
          onClick={() => {
            setSentAt(null);
            setError(null);
          }}
          className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 hover:underline"
        >
          Resend
        </button>
      )}
    </div>
  );
}
