import { NextRequest, NextResponse } from "next/server";
import { supabase, adminIdentity } from "@/lib/auth";
import { absolute, safeNext } from "@/lib/urls";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  try {
    const client = await supabase();
    if(code) { const { error } = await client.auth.exchangeCodeForSession(code); if(!error && await adminIdentity()) return NextResponse.redirect(absolute(safeNext(request.nextUrl.searchParams.get("next")))); }
    await client.auth.signOut();
  } catch { /* Never return provider details. */ }
  return NextResponse.redirect(absolute("/login?error=access"));
}
