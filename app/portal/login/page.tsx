"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestMagicLinkAction, type MagicLinkState } from "./actions";

const initialState: MagicLinkState = {};

export default function PortalLoginPage() {
  const [state, formAction, pending] = useActionState(requestMagicLinkAction, initialState);

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-teal-700 mb-2 text-center">
          HealthLens
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">
          My reports
        </h1>
        <p className="text-sm text-neutral-500 text-center mb-6">
          Enter the email you used when submitting a report — we&apos;ll send you a link to sign in,
          no password needed.
        </p>

        {state.sent ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
            <p className="text-sm font-medium text-teal-900">Check your email</p>
            <p className="mt-1 text-sm text-teal-700">
              We sent a sign-in link to {state.email}. Click it to view your reports.
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="input"
                placeholder="jane@example.com"
              />
            </div>
            {state.error && <p className="text-xs text-red-600">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 transition-colors"
            >
              {pending ? "Sending…" : "Send me a sign-in link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-neutral-500">
          <Link href="/" className="text-teal-700 hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgb(212 212 212);
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.9rem;
          background: white;
        }
        .input:focus {
          outline: 2px solid rgb(15 118 110);
          outline-offset: 1px;
        }
      `}</style>
    </main>
  );
}
