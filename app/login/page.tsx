"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-teal-700 mb-2 text-center">
          Health Bridge Solution
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 text-center mb-6">
          Staff sign in
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
            <input name="password" type="password" required className="input" />
          </div>
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-white font-semibold hover:bg-teal-800 disabled:opacity-60 transition-colors"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Need a staff account?{" "}
          <Link href="/signup" className="text-teal-700 hover:underline">
            Create one
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
