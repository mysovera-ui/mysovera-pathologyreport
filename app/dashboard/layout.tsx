import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: middleware already gates /dashboard, but Server
  // Components shouldn't rely solely on middleware for auth (per Supabase's
  // Next.js guidance) since a misconfigured matcher elsewhere could skip it.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: staffRow } = await supabase
    .from("staff_members")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();

  if (!staffRow) {
    redirect("/unauthorized");
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-3 border-b border-neutral-200 bg-white px-6 py-2 text-xs text-neutral-500">
        <span>{user.email}</span>
        <form action={logoutAction}>
          <button type="submit" className="text-teal-700 hover:underline">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
