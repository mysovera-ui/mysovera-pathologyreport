"use client";

import { useActionState } from "react";
import { deliverReportAction, type DeliverFormState } from "./actions";

const initialState: DeliverFormState = {};

export function DeliveryForm({ submissionId }: { submissionId: string }) {
  const boundAction = deliverReportAction.bind(null, submissionId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-xs">
          {state.error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">
          PDF URL
        </label>
        <input
          name="pdf_url"
          type="text"
          required
          placeholder="https://…"
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">
          Delivered by
        </label>
        <input
          name="delivered_by"
          type="text"
          required
          placeholder="Your name"
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">
          Notes (optional)
        </label>
        <textarea
          name="delivery_notes"
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Mark Delivered"}
      </button>
    </form>
  );
}
