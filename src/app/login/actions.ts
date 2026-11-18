"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabase } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { absolute, path } from "@/lib/urls";
import { configured } from "@/lib/env";
export async function magicLink(form: FormData) {
  const email = z.email().safeParse(form.get("email"));
  if (email.success && configured) {
    try { await rateLimit("magic-link-global", 10, 300); const client = await supabase(); await client.auth.signInWithOtp({ email: email.data, options: { shouldCreateUser: false, emailRedirectTo: absolute("/auth/callback") } }); } catch { /* Generic response avoids account enumeration and secret leakage. */ }
  }
  redirect(path("/login?sent=1"));
}
export async function githubLogin() {
  let destination: string | undefined;
  try { await rateLimit("oauth-global", 30, 300); const client = await supabase(); const { data } = await client.auth.signInWithOAuth({ provider: "github", options: { redirectTo: absolute("/auth/callback") } }); destination = data.url || undefined; } catch { /* Show generic failure. */ }
  if (destination) redirect(destination);
  redirect(path("/login?error=auth"));
}
export async function logout() { const client = await supabase(); await client.auth.signOut(); redirect(path("/login")); }
