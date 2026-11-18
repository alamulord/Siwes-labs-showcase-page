import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { env } from "./env";
import { path } from "./urls";
export async function supabase() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) throw new Error("Authentication is not configured");
  const store = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: {
    getAll: () => store.getAll(),
    setAll: (values) => { try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Refreshed by proxy for Server Components. */ } }
  } });
}
export async function adminIdentity() {
  if (!env.DATABASE_URL || !env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const client = await supabase();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return db.adminProfile.findUnique({ where: { id: data.user.id } });
}
export async function requireAdmin() {
  const admin = await adminIdentity();
  if (!admin) redirect(path("/login?error=access"));
  return admin;
}
export async function assertAdmin() {
  const admin = await adminIdentity();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
