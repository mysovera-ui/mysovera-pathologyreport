import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Handles the redirect from a Supabase magic-link email (PKCE code flow).
// Used by the customer portal's passwordless login -- staff sign in with a
// password directly and never hit this route.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/portal/login?error=1`);
}
