import { NextRequest,NextResponse } from "next/server";
import { supabase,adminIdentity } from "@/lib/auth";
import { absolute,safeNext } from "@/lib/urls";
export async function GET(request:NextRequest){
  const hash=request.nextUrl.searchParams.get("token_hash");
  try{const client=await supabase();if(hash&&hash.length<1000){const {error}=await client.auth.verifyOtp({token_hash:hash,type:"email"});if(!error&&await adminIdentity())return NextResponse.redirect(absolute(safeNext(request.nextUrl.searchParams.get("next"))));}await client.auth.signOut();}catch{/* Generic errors only. */}
  return NextResponse.redirect(absolute("/login?error=access"));
}
