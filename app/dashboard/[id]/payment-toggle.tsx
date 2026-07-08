"use client";

import { useState, useTransition } from "react";
import { updatePaymentAction } from "./actions";
import type { PaymentStatus } from "@/lib/db/types";

const OPTIONS: PaymentStatus[] = ["unpaid", "paid", "waived"];

export function PaymentToggle({
  submissionId,
  payment,
}: {
  submissionId: string;
  payment: PaymentStatus;
}) {
  const [current, setCurrent] = useState(payment);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="flex gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            disabled={isPending || opt === current}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await updatePaymentAction(submissionId, opt);
                if (result.error) setError(result.error);
                else setCurrent(opt);
              });
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors ${
              opt === current
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
