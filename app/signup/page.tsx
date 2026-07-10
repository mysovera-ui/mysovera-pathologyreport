"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-teal-700 mb-2 text-center">
          Health Bridge Solution
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 text-center mb-6">
          Create staff account
        </h1>

        <form action={formAction} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="input"
              placeholder="you@healthbridgesolution.my"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Password</label>
            <input name="password" type="password" required minLength={8} className="input" />
          </div>
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
          {state.info && <p className="text-xs text-teal-700">{state.info}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 transition-colors"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-700 hover:underline">
            Sign in
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
