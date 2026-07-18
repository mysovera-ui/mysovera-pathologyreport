import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "./dashboard-nav";

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
    <div className="min-h-screen bg-neutral-50">
      <DashboardNav email={user.email ?? ""} />
      <div className="md:pl-60">{children}</div>
    </div>
  );
}
