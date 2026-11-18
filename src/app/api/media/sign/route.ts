import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/lib/auth";
import { cloud } from "@/lib/media";
import { rateLimit } from "@/lib/rate-limit";
import { origin } from "@/lib/urls";
export async function POST(request:NextRequest) {
  try {
    if(request.headers.get("origin")!==origin)return NextResponse.json({error:"Forbidden"},{status:403});
    const admin=await assertAdmin();await rateLimit(`upload:${admin.id}`,30,300);
    const c=cloud();const timestamp=Math.floor(Date.now()/1000);
    const params={timestamp,public_id:`siwes/${admin.id}/${crypto.randomUUID()}`,type:"authenticated",upload_preset:"siwes_private",overwrite:false};
    return NextResponse.json({...params,signature:c.utils.api_sign_request(params,process.env.CLOUDINARY_API_SECRET!),api_key:process.env.CLOUDINARY_API_KEY,cloud_name:process.env.CLOUDINARY_CLOUD_NAME},{headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"Upload unavailable or access denied"},{status:403}); }
}
