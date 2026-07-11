"use client";

import { useActionState } from "react";
import { submitConsultationRequestAction, type ConsultationFormState } from "./actions";

const initialState: ConsultationFormState = {};

export function ConsultationForm({
  submissionId,
  referenceCode,
  defaultName,
  defaultEmail,
}: {
  submissionId: string;
  referenceCode: string;
  defaultName: string;
  defaultEmail: string;
}) {
  const boundAction = submitConsultationRequestAction.bind(null, submissionId, referenceCode);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-800 font-semibold">Request received!</p>
        <p className="mt-1 text-sm text-green-700">
          Our team will reach out to arrange a time. Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-sm">
          {state.error}
        </div>
      )}

      <label className="block">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Full name</span>
        <input
          name="customer_name"
          type="text"
          required
          defaultValue={defaultName}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Phone (optional)</span>
        <input
          name="phone"
          type="tel"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Who would you like to speak with?</span>
        <select name="consultation_type" defaultValue="nutritionist" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white">
          <option value="nutritionist">Nutritionist (diet & lifestyle)</option>
          <option value="doctor">Doctor (medical)</option>
          <option value="either">Either is fine</option>
        </select>
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Preferred time (optional)</span>
        <input
          name="preferred_time"
          type="text"
          placeholder="e.g. Weekday evenings, Saturday mornings"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="block text-sm font-medium text-neutral-700 mb-1">Anything else? (optional)</span>
        <textarea
          name="notes"
          rows={3}
          placeholder="What would you like to discuss?"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-teal-700 px-6 py-3 text-white font-semibold hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request consultation"}
      </button>

      <p className="text-xs text-neutral-400 text-center">
        This is a request, not a confirmed booking — our team will follow up to arrange a time.
      </p>
    </form>
  );
}
