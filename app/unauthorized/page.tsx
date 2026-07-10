import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center rounded-xl border border-neutral-200 bg-white p-8">
        <h1 className="text-xl font-bold text-neutral-900">Not authorized</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Your account isn&apos;t on the staff list for this dashboard. Ask an existing
          staff member to add your email to <code className="text-xs">staff_members</code>.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link href="/" className="text-sm text-teal-700 hover:underline">
            Back to home
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-neutral-500 hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
