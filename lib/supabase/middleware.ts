import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, skip the auth refresh and pass through.
  // Without this guard createServerClient throws "Your project's URL and Key
  // are required", crashing the edge middleware on every route (500
  // MIDDLEWARE_INVOCATION_FAILED).
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  try {
    let response = supabaseResponse;
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Refresh session so it doesn't expire while user is active
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    if (path.startsWith("/dashboard")) {
      if (!user) {
        const redirectUrl = new URL("/login", request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // staff_members RLS only allows a user to read their own row (see
      // migration 0010_staff_auth_lockdown.sql), so this is safe on the
      // anon+auth client -- it can never be used to browse other staff.
      const { data: staffRow } = await supabase
        .from("staff_members")
        .select("email")
        .eq("email", user.email ?? "")
        .maybeSingle();

      if (!staffRow) {
        const redirectUrl = new URL("/unauthorized", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Customer self-serve portal: any verified logged-in email may in --
    // unlike /dashboard there's no allowlist, since every customer who
    // submitted a report is entitled to see their own history. The
    // customers_read_own_submissions RLS policy (migration 0018) is what
    // actually restricts what they can see once in, scoped to their own
    // email -- this check is just the login gate.
    if (path.startsWith("/portal") && path !== "/portal/login") {
      if (!user) {
        const redirectUrl = new URL("/portal/login", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return response;
  } catch {
    // Never let an auth hiccup crash the entire edge middleware
    return supabaseResponse;
  }
}
