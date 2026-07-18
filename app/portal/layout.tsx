import { createClient } from "@/lib/supabase/server";
import { PortalNav } from "./portal-nav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session (e.g. /portal/login, or an expired cookie mid-navigation) --
  // render children bare with no nav chrome. Each page under /portal handles
  // its own auth redirect; middleware already gates non-login portal paths.
  if (!user?.email) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PortalNav email={user.email} />
      <div className="md:pl-60">{children}</div>
    </div>
  );
}
