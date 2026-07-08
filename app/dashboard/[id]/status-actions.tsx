"use client";

import { useState, useTransition } from "react";
import { updateStatusAction } from "./actions";
import type { ReportStatus } from "@/lib/db/types";

const NEXT_STATUS: Partial<Record<ReportStatus, { next: ReportStatus; label: string }>> = {
  received: { next: "reviewing", label: "Start Reviewing" },
  reviewing: { next: "completed", label: "Mark Completed" },
};

export function StatusActions({
  submissionId,
  status,
}: {
  submissionId: string;
  status: ReportStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const action = NEXT_STATUS[status];

  if (!action) {
    return (
      <p className="text-sm text-neutral-500">
        {status === "completed"
          ? "Ready for delivery below."
          : "No further status action — already delivered."}
      </p>
    );
  }

  return (
    <div>
      <button
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await updateStatusAction(submissionId, action.next);
            if (result.error) setError(result.error);
          });
        }}
        className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {isPending ? "Updating…" : action.label}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
