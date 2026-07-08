"use client";

import { useActionState, useState } from "react";
import { submitFeedbackAction, type FeedbackFormState } from "./actions";

const initialState: FeedbackFormState = {};

export function FeedbackForm({ submissionId }: { submissionId: string }) {
  const boundAction = submitFeedbackAction.bind(null, submissionId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [rating, setRating] = useState(0);

  if (state.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-800 font-semibold">Thank you for your feedback!</p>
        <p className="mt-1 text-sm text-green-700">
          We appreciate you letting us know how we did.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          How would you rate the report you received?
        </label>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-3xl leading-none ${n <= rating ? "text-amber-500" : "text-neutral-300"}`}
              aria-label={`${n} star`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Tell us more (optional)
        </label>
        <textarea
          name="feedback_text"
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="What did you think of your summary?"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="follow_up_interest" className="rounded" />
        I&apos;d like a follow-up consultation
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-700 px-6 py-3 text-white font-semibold hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit feedback"}
      </button>
    </form>
  );
}
