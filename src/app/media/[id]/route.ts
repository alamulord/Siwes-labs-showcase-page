import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { configured } from "@/lib/env";
import { adminIdentity } from "@/lib/auth";
import { cloud, isPublicAsset } from "@/lib/media";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!configured)return new NextResponse("Not found",{status:404});
  const publicAccess=await isPublicAsset(id);
  if(!publicAccess && !await adminIdentity())return new NextResponse("Not found",{status:404});
  const asset=await db.mediaAsset.findUnique({where:{id}});
  if(!asset)return new NextResponse("Not found",{status:404});
  try {
    const requestedWidth=Number(request.nextUrl.searchParams.get("w"));
    const variant=[640,1280].includes(requestedWidth)&&asset.resourceType==="image"&&asset.format!=="pdf";
    const url=variant
      ? cloud().url(asset.publicId,{resource_type:"image",type:"authenticated",secure:true,sign_url:true,transformation:[{width:requestedWidth,crop:"limit",quality:"auto"}],format:"webp"})
      : cloud().utils.private_download_url(asset.publicId,asset.resourceType==="raw" ? "" : asset.format,{resource_type:asset.resourceType,type:"authenticated",expires_at:Math.floor(Date.now()/1000)+60,attachment:false});
    const upstream=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(20000)});
    if(!upstream.ok)throw new Error("PROVIDER_ERROR");
    const download=request.nextUrl.searchParams.has("download") || ["zip","pptx","txt"].includes(asset.format);
    return new NextResponse(upstream.body,{headers:{"Content-Type":variant?"image/webp":asset.mimeType,"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff","Content-Disposition":`${download?"attachment":"inline"}; filename="siwes-${asset.id}.${variant?"webp":asset.format}"`,"Content-Security-Policy":"default-src 'none'; sandbox"}});
  } catch {return new NextResponse("Media temporarily unavailable",{status:502});}
}
