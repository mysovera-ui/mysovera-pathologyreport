"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

export type SignupState = { error?: string; info?: string };

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // Only pre-approved staff emails can create an account at all -- ask an
  // existing staff member to add yours to staff_members if this fails.
  const service = createServiceClient();
  const { data: staffRow } = await service
    .from("staff_members")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!staffRow) {
    return {
      error: "That email isn't on the staff allowlist yet. Ask an existing staff member to add it first.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message || "Could not create the account. Please try again." };
  }

  if (!data.session) {
    return { info: "Account created — check your email to confirm it, then sign in." };
  }

  redirect("/dashboard");
}
