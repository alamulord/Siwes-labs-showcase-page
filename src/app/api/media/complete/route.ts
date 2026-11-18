import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth";
import { cloud, validateAsset, formats } from "@/lib/media";
import { db } from "@/lib/db";
import { origin } from "@/lib/urls";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(request:NextRequest) {
  try {
    if(request.headers.get("origin")!==origin)return NextResponse.json({error:"Forbidden"},{status:403});
    const admin=await assertAdmin();await rateLimit(`complete:${admin.id}`,40,300);
    const input=z.object({publicId:z.string().max(200),resourceType:z.enum(["image","raw","video"]),alt:z.string().trim().min(1).max(200)}).parse(await request.json());
    const prefix=`siwes/${admin.id}/`;
    if(!input.publicId.startsWith(prefix))throw new Error("INVALID_OWNER");
    const asset=await cloud().api.resource(input.publicId,{resource_type:input.resourceType,type:"authenticated"});
    // Raw resources may omit format; obtain extension from the authoritative public ID.
    const format=asset.format || asset.public_id.split(".").pop();
    validateAsset({...asset,format},prefix);
    if(asset.resource_type==="image" && format!=="pdf"){
      await cloud().uploader.explicit(asset.public_id,{type:"authenticated",resource_type:"image",eager:[{width:640,crop:"limit",quality:"auto",format:"webp"},{width:1280,crop:"limit",quality:"auto",format:"webp"}],eager_async:false});
    }
    const saved=await db.mediaAsset.upsert({where:{providerAssetId:asset.asset_id},create:{providerAssetId:asset.asset_id,publicId:asset.public_id,deliveryUrl:asset.secure_url,resourceType:asset.resource_type,format,mimeType:formats[format],bytes:asset.bytes,width:asset.width||null,height:asset.height||null,alt:input.alt,ownerId:admin.id},update:{alt:input.alt}});
    return NextResponse.json({id:saved.id},{headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"The upload could not be verified or attached."},{status:400}); }
}
